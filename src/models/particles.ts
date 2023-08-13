// ===== particles.ts =========================================================
// Particle system using transform feedback + GPGPU and VAO instancing
// Ben Coleman, 2023
// ============================================================================

import {
  BufferInfo,
  ProgramInfo,
  createBufferInfoFromArrays,
  createProgramInfo,
  createTransformFeedback,
  createVertexArrayInfo,
  drawBufferInfo,
  setBuffersAndAttributes,
  setUniforms,
  primitives,
  drawObjectList,
  VertexArrayInfo,
  DrawObject,
} from 'twgl.js'

import fragShaderUpdate from '../../shaders/particles/update.frag'
import vertShaderUpdate from '../../shaders/particles/update.vert'
import fragShaderRender from '../../shaders/particles/render.frag'
import vertShaderRender from '../../shaders/particles/render.vert'

import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../core/stats.ts'
import log from 'loglevel'
import { TextureCache } from '../index.ts'

export class ParticleSystem implements Renderable {
  private progInfoUpdate: ProgramInfo
  private progInfoRender: ProgramInfo
  private inputBuffInfo: BufferInfo
  private outputBuffInfo: BufferInfo
  private outputVAO: VertexArrayInfo
  public texture: WebGLTexture
  private objList: DrawObject[]
  public emitRate: number
  public minLifetime: number
  public maxLifetime: number

  constructor(gl: WebGL2RenderingContext, maxParticles: number) {
    this.emitRate = 200
    this.minLifetime = 0.1
    this.maxLifetime = 3.0

    this.progInfoUpdate = createProgramInfo(gl, [vertShaderUpdate, fragShaderUpdate], {
      transformFeedbackVaryings: ['tf_position', 'tf_velocity', 'tf_age', 'tf_lifetime'],
    })
    this.progInfoRender = createProgramInfo(gl, [vertShaderRender, fragShaderRender])

    const positions = new Float32Array(maxParticles * 3)
    const velocities = new Float32Array(maxParticles * 3)
    const ages = new Float32Array(maxParticles)
    const lifetimes = new Float32Array(maxParticles)

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0

      ages[i] = 0
      lifetimes[i] = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime
    }

    this.inputBuffInfo = createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: positions, divisor: 0 },
      velocity: { numComponents: 3, data: velocities, divisor: 0 },
      age: { numComponents: 1, data: ages, divisor: 0 },
      lifetime: { numComponents: 1, data: lifetimes, divisor: 0 },
    })

    // Make a quad for rendering the particles
    const quadVerts = primitives.createXYQuadVertices(4)
    Object.assign(quadVerts, {
      tf_position: { numComponents: 3, data: positions, divisor: 1 },
      tf_velocity: { numComponents: 3, data: velocities, divisor: 1 },
      tf_age: { numComponents: 1, data: ages, divisor: 1 },
      tf_lifetime: { numComponents: 1, data: lifetimes, divisor: 1 },
    })
    this.outputBuffInfo = createBufferInfoFromArrays(gl, quadVerts)

    this.outputVAO = createVertexArrayInfo(gl, this.progInfoRender, this.outputBuffInfo)
    this.objList = [
      {
        programInfo: this.progInfoRender,
        vertexArrayInfo: this.outputVAO,
        uniforms: {},
        instanceCount: this.emitRate,
      },
    ]

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
    this.objList = [
      {
        programInfo: this.progInfoRender,
        vertexArrayInfo: this.outputVAO,
        uniforms: {},
        instanceCount: this.emitRate,
      },
    ]

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

  // Update the particles positions and velocities
  private updateParticles(gl: WebGL2RenderingContext) {
    const tf = createTransformFeedback(gl, this.progInfoUpdate, this.outputBuffInfo)

    gl.enable(gl.RASTERIZER_DISCARD)
    gl.useProgram(this.progInfoUpdate.program)

    setBuffersAndAttributes(gl, this.progInfoUpdate, this.inputBuffInfo)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)

    gl.beginTransformFeedback(gl.POINTS)

    setUniforms(this.progInfoUpdate, {
      u_time: Stats.totalTime,
      u_deltaTime: Stats.deltaTime,
      u_randTex: TextureCache.defaultRand,
      u_maxInstances: this.inputBuffInfo.numElements,
      u_lifetime: [this.minLifetime, this.maxLifetime],
    })

    drawBufferInfo(gl, this.inputBuffInfo, gl.POINTS)

    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
    gl.disable(gl.RASTERIZER_DISCARD)
  }

  // Render the particles
  private renderParticles(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    gl.useProgram(this.progInfoRender.program)

    const uni = {
      ...uniforms,
      u_texture: this.texture,
    }
    setUniforms(this.progInfoRender, uni)
    this.objList[0].uniforms = uni

    setBuffersAndAttributes(gl, this.progInfoRender, this.outputVAO)

    gl.depthMask(false)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    drawObjectList(gl, this.objList)

    gl.disable(gl.BLEND)
    gl.depthMask(true)
  }
}
