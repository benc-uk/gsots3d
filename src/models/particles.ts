// ===== particles.ts =========================================================
// Particle system using transform feedback and GPGPU
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
  createTexture,
  VertexArrayInfo,
  DrawObject,
} from 'twgl.js'

import fragShaderUpdate from '../../shaders/particles/update.frag'
import vertShaderUpdate from '../../shaders/particles/update.vert'
import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../core/stats.ts'
import log from 'loglevel'

const vs = `#version 300 es
precision highp float;

in vec4 position;
in vec2 texcoord;
in vec3 tf_position;
in vec3 tf_velocity;
in float tf_age;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat4 u_world;

out vec2 v_texcoord;
out float v_age;
out vec3 v_position;

void main() {
  v_texcoord = texcoord;
  v_age = tf_age;

  vec4 view_pos = u_view * u_world * vec4(tf_position, 1.0);
  // Billboarding magic
  gl_Position = u_proj * (view_pos + vec4(position.xy, 0.0, 0.0));
  v_position = (u_world * vec4(tf_position, 1.0)).xyz;
}
`

const fs = `#version 300 es
precision highp float;

in vec2 v_texcoord;
in float v_age;
in vec3 v_position;

uniform sampler2D u_texture;
out vec4 outColor;

void main() {
  vec4 tex = texture(u_texture, v_texcoord);

  // make redder as particle goes up y axis
  tex.r = (180.0 - v_position.y) / 180.0;

  tex.a = 1.0 - v_age;

  outColor = tex;
}
`

export class Particles implements Renderable {
  private gl: WebGL2RenderingContext
  private progInfoUpdate: ProgramInfo
  private progInfoRender: ProgramInfo

  private inputBuffInfo: BufferInfo
  private outputBuffInfo: BufferInfo
  private outputVAO: VertexArrayInfo

  private speed: number
  private maxAge: number

  private texture: WebGLTexture
  private objList: DrawObject[]

  constructor(gl: WebGL2RenderingContext, maxParticles: number, speed: number, maxAge: number) {
    this.gl = gl

    this.progInfoUpdate = createProgramInfo(gl, [vertShaderUpdate, fragShaderUpdate], {
      transformFeedbackVaryings: ['tf_position', 'tf_velocity', 'tf_age'],
    })
    this.progInfoRender = createProgramInfo(gl, [vs, fs])

    const positions = new Float32Array(maxParticles * 3)
    const velocities = new Float32Array(maxParticles * 3)
    const ages = new Float32Array(maxParticles)

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      velocities[i * 3] = Math.random() * 2 - 1
      velocities[i * 3 + 1] = Math.random() * 4
      velocities[i * 3 + 2] = Math.random() * 2 - 1

      ages[i] = Math.random()
    }

    this.inputBuffInfo = createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: positions, divisor: 0 },
      velocity: { numComponents: 3, data: velocities, divisor: 0 },
      age: { numComponents: 1, data: ages, divisor: 0 },
    })

    const quadVerts = primitives.createXYQuadVertices(4)
    Object.assign(quadVerts, {
      tf_position: { numComponents: 3, data: positions, divisor: 1 },
      tf_velocity: { numComponents: 3, data: velocities, divisor: 1 },
      tf_age: { numComponents: 1, data: ages, divisor: 1 },
    })
    this.outputBuffInfo = createBufferInfoFromArrays(gl, quadVerts)

    this.speed = speed
    this.maxAge = maxAge

    this.outputVAO = createVertexArrayInfo(gl, this.progInfoRender, this.outputBuffInfo)
    this.objList = [
      {
        programInfo: this.progInfoRender,
        vertexArrayInfo: this.outputVAO,
        uniforms: {},
        instanceCount: maxParticles,
      },
    ]

    // Create texture for particle
    this.texture = createTexture(gl, {
      src: '../../_textures/particles/particle.png',
    })

    log.info('✨ Created particle system with', maxParticles, 'particles')
  }

  /**
   * Render the particle system and implement the renderable interface
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    const tf = createTransformFeedback(gl, this.progInfoUpdate, this.outputBuffInfo)

    this.updateParticles(tf)
    this.renderParticles(gl, uniforms)

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
  private updateParticles(transFeedback: WebGLTransformFeedback) {
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

  // Render the particles
  private renderParticles(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    gl.useProgram(this.progInfoRender.program)

    const uni = {
      ...uniforms,
      u_speed: this.speed,
      u_maxAge: this.maxAge,
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
