// ===== particles.ts =========================================================
// Particle system
// Ben Coleman, 2023
// ============================================================================

import {
  BufferInfo,
  ProgramInfo,
  createBufferInfoFromArrays,
  createProgramInfo,
  createTransformFeedback,
  drawBufferInfo,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js'

import fragShaderUpdate from '../../shaders/particles/update.frag'
import vertShaderUpdate from '../../shaders/particles/update.vert'
import fragShaderRender from '../../shaders/particles/render.frag'
import vertShaderRender from '../../shaders/particles/render.vert'
import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../core/stats.ts'

export class Particles implements Renderable {
  private gl: WebGL2RenderingContext
  private progInfoUpdate: ProgramInfo
  private progInfoRender: ProgramInfo

  private inputBuffInfo: BufferInfo
  private outputBuffInfo: BufferInfo

  // Private maxParticles: number
  private speed: number
  private maxAge: number

  constructor(gl: WebGL2RenderingContext, maxParticles: number, speed: number, maxAge: number) {
    this.gl = gl

    this.progInfoUpdate = createProgramInfo(gl, [vertShaderUpdate, fragShaderUpdate], {
      transformFeedbackVaryings: ['tf_position', 'tf_velocity', 'tf_age'],
    })
    this.progInfoRender = createProgramInfo(gl, [vertShaderRender, fragShaderRender])

    const positions = new Float32Array(maxParticles * 3)
    const velocities = new Float32Array(maxParticles * 3)
    const ages = new Float32Array(maxParticles)

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      velocities[i * 3] = Math.random() * 2 - 1
      velocities[i * 3 + 1] = Math.random() * 5
      velocities[i * 3 + 2] = Math.random() * 2 - 1

      ages[i] = Math.random() * maxAge
    }

    this.inputBuffInfo = createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: positions },
      velocity: { numComponents: 3, data: velocities },
      age: { numComponents: 1, data: ages },
    })

    this.outputBuffInfo = createBufferInfoFromArrays(gl, {
      tf_position: { numComponents: 3, data: positions },
      tf_velocity: { numComponents: 3, data: velocities },
      tf_age: { numComponents: 1, data: ages },
    })

    this.speed = speed
    this.maxAge = maxAge
  }

  render(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    const tf = createTransformFeedback(gl, this.progInfoUpdate, this.outputBuffInfo)

    // Update particles
    this.update(tf)

    // Render the particles
    gl.useProgram(this.progInfoRender.program)

    setUniforms(this.progInfoRender, {
      ...uniforms,
      u_speed: this.speed,
      u_maxAge: this.maxAge,
    })

    setBuffersAndAttributes(gl, this.progInfoRender, this.outputBuffInfo)
    drawBufferInfo(gl, this.outputBuffInfo, gl.POINTS)

    // Swap the buffers, kinda ugly but it works!
    for (const attribName in this.inputBuffInfo.attribs) {
      const tempBuff = this.inputBuffInfo.attribs[attribName].buffer

      if (this.outputBuffInfo && this.outputBuffInfo.attribs && this.outputBuffInfo.attribs[`tf_${attribName}`]) {
        this.inputBuffInfo.attribs[attribName].buffer = this.outputBuffInfo.attribs[`tf_${attribName}`].buffer
        this.outputBuffInfo.attribs[`tf_${attribName}`].buffer = tempBuff
      }
    }
  }

  // Update the particles positions and velocities
  private update(transFeedback: WebGLTransformFeedback) {
    const gl = this.gl

    gl.enable(gl.RASTERIZER_DISCARD)
    gl.useProgram(this.progInfoUpdate.program)

    setUniforms(this.progInfoUpdate, {
      u_time: Stats.totalTime,
      u_deltaTime: Stats.deltaTime,
      u_speed: this.speed,
      u_maxAge: this.maxAge,
    })

    setBuffersAndAttributes(gl, this.progInfoUpdate, this.inputBuffInfo)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transFeedback)

    gl.beginTransformFeedback(gl.POINTS)
    drawBufferInfo(gl, this.inputBuffInfo, gl.POINTS)

    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
    gl.disable(gl.RASTERIZER_DISCARD)
  }
}
