// ===== part-inst.ts =========================================================
// Particle system using quad instancing **TEMP & EXPERIMENTAL**
// Ben Coleman, 2023
// ============================================================================

import * as twgl from 'twgl.js'

import { Renderable } from './types.ts'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../index.ts'

const vs = `#version 300 es
precision highp float;

in vec4 position;
in vec2 texcoord;
in vec3 inst_pos;
in vec3 inst_vec;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat4 u_world;
uniform float u_totalTime;

out vec2 v_texcoord;

void main() {
  v_texcoord = texcoord;

  vec4 view_pos = u_view * u_world * vec4(inst_pos + inst_vec * u_totalTime * 42.0, 1.0);
  gl_Position = u_proj * (view_pos + vec4(position.xy, 0.0, 0.0));
}
`

const fs = `#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_texture;
uniform float u_totalTime;
out vec4 outColor;

void main() {
  vec4 tex = texture(u_texture, v_texcoord);

  outColor = tex;
}
`

export class ParticlesInst implements Renderable {
  // Private gl: WebGL2RenderingContext
  private progInfo: twgl.ProgramInfo

  objList: twgl.DrawObject[]
  vertexArrayInfo: twgl.VertexArrayInfo

  constructor(gl: WebGL2RenderingContext) {
    this.progInfo = twgl.createProgramInfo(gl, [vs, fs], {})

    const maxParticles = 15000

    const positions = new Float32Array(maxParticles * 3)
    const vectors = new Float32Array(maxParticles * 3)
    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = Math.random() * 20 - 10
      positions[i * 3 + 1] = Math.random() * 20 - 10
      positions[i * 3 + 2] = Math.random() * 20 - 10

      // random vector in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 2
      const r = Math.random() * 1.5 + 0.5
      vectors[i * 3] = Math.sin(theta) * Math.cos(phi) * r
      vectors[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * r
      vectors[i * 3 + 2] = Math.cos(theta) * r
    }

    // const vertArrays = twgl.primitives.createSphereVertices(2, 6, 3)
    const vertArrays = twgl.primitives.createXYQuadVertices(4)

    Object.assign(vertArrays, {
      inst_pos: { numComponents: 3, data: positions, divisor: 1 },
      inst_vec: { numComponents: 3, data: vectors, divisor: 1 },
    })

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, vertArrays)
    this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.progInfo, bufferInfo)

    // Create texture for particle
    const tex = twgl.createTexture(gl, {
      src: '../../_textures/particles/particle.png',
    })
    const uniforms = {
      u_texture: tex,
    }

    this.objList = [
      {
        programInfo: this.progInfo,
        vertexArrayInfo: this.vertexArrayInfo,
        uniforms,
        instanceCount: maxParticles,
      },
    ]
  }

  render(gl: WebGL2RenderingContext, uniforms: UniformSet) {
    gl.useProgram(this.progInfo.program)

    // Disable depth write for particles
    gl.depthMask(false)

    // blend mode for particles
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    twgl.setBuffersAndAttributes(gl, this.progInfo, this.vertexArrayInfo)
    twgl.setUniforms(this.progInfo, {
      ...uniforms,
      u_totalTime: Stats.totalTime,
    })
    twgl.drawObjectList(gl, this.objList)

    gl.disable(gl.BLEND)
    gl.depthMask(true)
  }
}
