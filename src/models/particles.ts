// ===== particles.ts =========================================================
// Particle system using GPU for particle simulation and VAO instancing
// Ben Coleman, 2023
// ============================================================================

import * as twgl from 'twgl.js'
import log from 'loglevel'

import updateFS from '../../shaders/particles/update.frag'
import updateVS from '../../shaders/particles/update.vert'
import renderFS from '../../shaders/particles/render.frag'
import renderVS from '../../shaders/particles/render.vert'

import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../core/stats.ts'
import { RGBA, XYZ } from '../engine/tuples.ts'
import { TextureCache } from '../core/cache.ts'

/**
 * Particle system, uses transform feedback on the GPU to update particles
 * and VAO instancing to render them
 */
export class ParticleSystem implements Renderable {
  private progInfoUpdate: twgl.ProgramInfo
  private progInfoRender: twgl.ProgramInfo
  private inputBuffInfo: twgl.BufferInfo
  private outputBuffInfo: twgl.BufferInfo
  private outputVAO: twgl.VertexArrayInfo

  /** When enabled, particles will be spawned and emitted */
  public enabled: boolean
  /** Texture to use for particles */
  public texture: WebGLTexture
  /** Emission rate, number of particles per frame */
  public emitRate: number
  /** Min lifetime of particles in seconds */
  public minLifetime: number
  /** Max lifetime of particles in seconds  */
  public maxLifetime: number
  /** Gravity vector. Default: [0, -9.81, 0] */
  public gravity: XYZ
  /** Min power (speed) of particles, this is multiplied by the direction vector */
  public minPower: number
  /** Max power (speed) of particles, this is multiplied by the direction vector */
  public maxPower: number
  /** Particles will randomly emit in a direction between this vector and direction2 */
  public direction1: XYZ
  /** Particles will randomly emit in a direction between this vector and direction1 */
  public direction2: XYZ
  /** Particles are spawned in a bounding box, defined by this vector as one corner */
  public emitterBoxMin: XYZ
  /** Particles are spawned in a bounding box, defined by this vector as one corner */
  public emitterBoxMax: XYZ
  /** Speed up or slow down time */
  public timeScale: number
  /** Change colour and alpha as particle reaches it's lifetime. Default: [0,0,0,1] */
  public ageColour: RGBA
  /** Min random size of particles */
  public minSize: number
  /** Max random size of particles */
  public maxSize: number
  /** Min initial random rotation of particles in radians */
  public minInitialRotation: number
  /** Max initial random rotation of particles in radians */
  public maxInitialRotation: number
  /** Min random rotation speed of particles in radians per second */
  public minRotationSpeed: number
  /** Max random rotation speed of particles in radians per second */
  public maxRotationSpeed: number
  /** Duration of particle system in frames, -1 = forever. Default: -1 */
  public duration: number
  /** Acceleration or deceleration multiplier, default 1.0. Applied every frame, so keep values *very* close to 1.0 */
  public acceleration: number
  /** Blend source mode, default: 'SRC_ALPHA', leave alone unless you know what you are doing */
  public blendSource: number
  /** Blend destination mode, default: 'ONE', leave alone unless you know what you are doing */
  public blendDest: number
  /** Colour multiplier pre-applied to particle texture before ageing */
  public preColour: RGBA
  /** Emitter box position offset to move the origin of particles */
  public positionOffset: XYZ
  /** Age power curve */
  public agePower: number

  /**
   * Create a new particle system
   * @param gl WebGL2 rendering context
   * @param maxParticles Maximum number of particles in the system
   * @param baseSize Size of the particle quad
   */
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
    this.ageColour = [0.0, 0.0, 0.0, 1.0]
    this.minSize = 1.0
    this.maxSize = 1.0
    this.minInitialRotation = 0.0
    this.maxInitialRotation = 0.0
    this.minRotationSpeed = 0.0
    this.maxRotationSpeed = 0.0
    this.duration = -1
    this.enabled = true
    this.emitterBoxMin = [0, 0, 0]
    this.emitterBoxMax = [0, 0, 0]
    this.acceleration = 1.0
    this.blendSource = gl.SRC_ALPHA
    this.blendDest = gl.ONE
    this.preColour = [1.0, 1.0, 1.0, 1.0]
    this.positionOffset = [0, 0, 0]
    this.agePower = 1.0

    // Create shaders and programs
    this.progInfoUpdate = twgl.createProgramInfo(gl, [updateVS, updateFS], {
      transformFeedbackVaryings: ['tf_position', 'tf_velocity', 'tf_age', 'tf_props'],
    })
    this.progInfoRender = twgl.createProgramInfo(gl, [renderVS, renderFS])

    // Create initial buffers, note these are for ALL particles regardless of emission rate
    // These are all updated in the shader
    const positions = new Float32Array(maxParticles * 4)
    const velocities = new Float32Array(maxParticles * 3)
    const ages = new Float32Array(maxParticles * 2)
    const props = new Float32Array(maxParticles * 4)
    const seeds = new Float32Array(maxParticles)
    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      positions[i * 3 + 3] = 0 // Rotation

      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0

      ages[i * 2] = 0 // Age
      // Lifetime, initial random value to stop "bursting"
      ages[i * 2 + 1] = Math.random() * 3

      props[i * 4] = 1.0 // Size
      props[i * 4 + 1] = 0 // Rotation speed
      props[i * 4 + 2] = 0 // Unused
      props[i * 4 + 3] = 0 // Unused

      seeds[i] = Math.random()
    }

    // Create input buffer used by transform feedback & update shader
    // Note the divisor of 0, this means the data is static and will not change
    this.inputBuffInfo = twgl.createBufferInfoFromArrays(gl, {
      position: { numComponents: 4, data: positions, divisor: 0 },
      velocity: { numComponents: 3, data: velocities, divisor: 0 },
      age: { numComponents: 2, data: ages, divisor: 0 },
      props: { numComponents: 4, data: props, divisor: 0 },
      seed: { numComponents: 1, data: seeds, divisor: 0 },
    })

    // Create output buffer used by transform feedback & update shader
    // Note the divisor of 1, this means the data is dynamic and will change
    const quadVerts = twgl.primitives.createXYQuadVertices(baseSize)
    // Mutate/merge the quadVerts object to add our custom attributes
    Object.assign(quadVerts, {
      tf_position: { numComponents: 4, data: positions, divisor: 1 },
      tf_velocity: { numComponents: 3, data: velocities, divisor: 1 },
      tf_age: { numComponents: 2, data: ages, divisor: 1 },
      tf_props: { numComponents: 4, data: props, divisor: 1 },
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
    if (this.duration == 0) {
      this.enabled = false
    }
    if (this.duration > 0) {
      this.duration--
    }

    gl.blendFunc(this.blendSource, this.blendDest)
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
      u_deltaTime: Stats.deltaTime * this.timeScale,
      u_randTex: TextureCache.defaultRand,

      // NOTE: ULTRA IMPORTANT! Without this the rand function in the shader will not work
      u_maxInstances: this.inputBuffInfo.numElements,

      u_enabled: this.enabled,
      u_lifetimeMinMax: [this.minLifetime, this.maxLifetime],
      u_gravity: this.gravity,
      u_powerMinMax: [this.minPower, this.maxPower],
      u_direction1: this.direction1,
      u_direction2: this.direction2,
      u_timeScale: this.timeScale,
      u_sizeMinMax: [this.minSize, this.maxSize],
      u_initialRotationMinMax: [this.minInitialRotation, this.maxInitialRotation],
      u_rotationSpeedMinMax: [this.minRotationSpeed, this.maxRotationSpeed],
      u_emitterBoxMin: this.emitterBoxMin,
      u_emitterBoxMax: this.emitterBoxMax,
      u_accel: this.acceleration,
      u_posOffset: this.positionOffset,
    })

    twgl.drawBufferInfo(gl, this.inputBuffInfo, gl.POINTS, this.emitRate)

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
      u_ageColour: this.ageColour,
      u_preColour: this.preColour,
      u_agePower: this.agePower,
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
    twgl.drawObjectList(gl, objList)
  }
}
