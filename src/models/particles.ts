// ===== particles.ts =========================================================
// Particle system using transform feedback + GPGPU and VAO instancing
// Ben Coleman, 2023
// ============================================================================

import * as twgl from 'twgl.js'
import log from 'loglevel'

import fragShaderUpdate from '../../shaders/particles/update.frag'
import vertShaderUpdate from '../../shaders/particles/update.vert'
import fragShaderRender from '../../shaders/particles/render.frag'
import vertShaderRender from '../../shaders/particles/render.vert'

import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../core/stats.ts'
import { TextureCache, XYZ } from '../index.ts'

export class ParticleSystem implements Renderable {
  private progInfoUpdate: twgl.ProgramInfo
  private progInfoRender: twgl.ProgramInfo
  private inputBuffInfo: twgl.BufferInfo
  private outputBuffInfo: twgl.BufferInfo
  private outputVAO: twgl.VertexArrayInfo

  public texture: WebGLTexture

  public emitRate: number
  public minLifetime: number
  public maxLifetime: number
  public gravity: XYZ
  public minPower: number
  public maxPower: number
  public direction1: XYZ
  public direction2: XYZ
  public timeScale: number
  public ageColourAlpha: number
  public ageColourRed: number
  public ageColourGreen: number
  public ageColourBlue: number

  constructor(gl: WebGL2RenderingContext, maxParticles: number, baseSize: number) {
    this.emitRate = 300
    this.minLifetime = 2.0
    this.maxLifetime = 6.0
    this.minPower = 25
    this.maxPower = 35
    this.gravity = [0, -9.81, 0]
    this.direction1 = [-0.5, 1, -0.5]
    this.direction2 = [0.5, 1, 0.5]
    this.timeScale = 3.0
    this.ageColourAlpha = 1.0
    this.ageColourRed = 0.0
    this.ageColourGreen = 0.0
    this.ageColourBlue = 0.0

    // Create shaders and programs
    this.progInfoUpdate = twgl.createProgramInfo(gl, [vertShaderUpdate, fragShaderUpdate], {
      transformFeedbackVaryings: ['tf_position', 'tf_velocity', 'tf_age', 'tf_lifetime'],
    })
    this.progInfoRender = twgl.createProgramInfo(gl, [vertShaderRender, fragShaderRender])

    // Create initial buffers, note these are for ALL particles regardless of emission rate
    const positions = new Float32Array(maxParticles * 3)
    const velocities = new Float32Array(maxParticles * 3)
    const ages = new Float32Array(maxParticles)
    const lifetimes = new Float32Array(maxParticles)
    const seeds = new Float32Array(maxParticles)
    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0

      ages[i] = 0

      // Note this is SUPER important, it acts as a random seed
      lifetimes[i] = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime

      seeds[i] = Math.random()
    }

    // Create input buffer used by transform feedback & update shader
    // Note the divisor of 0, this means the data is static and will not change
    this.inputBuffInfo = twgl.createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: positions, divisor: 0 },
      velocity: { numComponents: 3, data: velocities, divisor: 0 },
      age: { numComponents: 1, data: ages, divisor: 0 },
      lifetime: { numComponents: 1, data: lifetimes, divisor: 0 },
      seed: { numComponents: 1, data: seeds, divisor: 0 },
    })

    // Create output buffer used by transform feedback & update shader
    // Note the divisor of 1, this means the data is dynamic and will change
    const quadVerts = twgl.primitives.createXYQuadVertices(baseSize)
    // Mutate/merge the quadVerts object to add our custom attributes
    Object.assign(quadVerts, {
      tf_position: { numComponents: 3, data: positions, divisor: 1 },
      tf_velocity: { numComponents: 3, data: velocities, divisor: 1 },
      tf_age: { numComponents: 1, data: ages, divisor: 1 },
      tf_lifetime: { numComponents: 1, data: lifetimes, divisor: 1 },
    })
    // Now create the buffer and VAO
    this.outputBuffInfo = twgl.createBufferInfoFromArrays(gl, quadVerts)

    this.outputVAO = twgl.createVertexArrayInfo(gl, this.progInfoRender, this.outputBuffInfo)

    // Create texture for particle
    this.texture = TextureCache.defaultWhite

    log.info('✨ Created particle system with', maxParticles, 'particles')
  }

  /**
   * Render the particle system and implement the renderable interface
   * @param gl WebGL2 rendering context
   * @param uniforms Uniforms to pass to the shaders
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    this.updateParticles(gl)
    this.renderParticles(gl, uniforms)

    // Swap the buffers between input & output, kinda weird and ugly but it works!
    for (const attribName in this.inputBuffInfo.attribs) {
      const tempBuff = this.inputBuffInfo.attribs[attribName].buffer

      if (this.outputBuffInfo && this.outputBuffInfo.attribs && this.outputBuffInfo.attribs[`tf_${attribName}`]) {
        this.inputBuffInfo.attribs[attribName].buffer = this.outputBuffInfo.attribs[`tf_${attribName}`].buffer
        this.outputBuffInfo.attribs[`tf_${attribName}`].buffer = tempBuff
      }
    }
  }

  /**
   * Update the particles positions and velocities
   */
  private updateParticles(gl: WebGL2RenderingContext) {
    const tf = twgl.createTransformFeedback(gl, this.progInfoUpdate, this.outputBuffInfo)

    gl.enable(gl.RASTERIZER_DISCARD)
    gl.useProgram(this.progInfoUpdate.program)

    twgl.setBuffersAndAttributes(gl, this.progInfoUpdate, this.inputBuffInfo)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)

    gl.beginTransformFeedback(gl.POINTS)

    twgl.setUniforms(this.progInfoUpdate, {
      u_time: Stats.totalTime,
      u_deltaTime: Stats.deltaTime,
      u_randTex: TextureCache.defaultRand,

      // NOTE: ULTRA IMPORTANT! Without this the rand function in the shader will not work
      u_maxInstances: this.inputBuffInfo.numElements,

      u_lifetimeMinMax: [this.minLifetime, this.maxLifetime],
      u_gravity: this.gravity,
      u_powerMinMax: [this.minPower, this.maxPower],
      u_direction1: this.direction1,
      u_direction2: this.direction2,
      u_timeScale: this.timeScale,
    })

    twgl.drawBufferInfo(gl, this.inputBuffInfo, gl.POINTS)

    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
    gl.disable(gl.RASTERIZER_DISCARD)
  }

  /**
   * Render the particles to the world
   */
  private renderParticles(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    gl.useProgram(this.progInfoRender.program)

    const particleUniforms = {
      ...uniforms,
      u_texture: this.texture,
      u_ageColour: [this.ageColourRed, this.ageColourGreen, this.ageColourBlue, this.ageColourAlpha],
    }

    twgl.setUniforms(this.progInfoRender, particleUniforms)

    const objList = [
      {
        programInfo: this.progInfoRender,
        vertexArrayInfo: this.outputVAO,
        uniforms: particleUniforms,
        instanceCount: this.emitRate,
      },
    ]

    twgl.setBuffersAndAttributes(gl, this.progInfoRender, this.outputVAO)

    gl.depthMask(false)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    twgl.drawObjectList(gl, objList)

    gl.disable(gl.BLEND)
    gl.depthMask(true)
  }
}
