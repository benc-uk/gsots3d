// ===== models/model.ts ======================================================
// Instance class, holds a model and position, rotation, scale etc
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { Model } from './model.ts'
import { ProgramInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms } from 'twgl.js'
import { UniformSet } from '../core/types.ts'

export class Instance {
  public model: Model
  public position: [number, number, number] = [0, 0, 0]
  public scale: [number, number, number] = [1, 1, 1]
  public rotate: [number, number, number] = [0, 0, 0]
  public transparent = false

  /**
   * @param {Model} model - Model to use for this instance
   * @param {[number, number, number]} position - Position of the instance
   */
  constructor(model: Model, position: [number, number, number]) {
    this.position = position
    this.model = model
  }

  rotateY(angle: number) {
    this.rotate[1] += angle
  }

  rotateX(angle: number) {
    this.rotate[0] += angle
  }

  rotateZ(angle: number) {
    this.rotate[2] += angle
  }

  render(gl: WebGL2RenderingContext, uniforms: UniformSet, viewProjection: mat4, programInfo: ProgramInfo) {
    if (!gl) return

    // Move object into the world
    const world = mat4.create()
    if (this.position) {
      mat4.translate(world, world, this.position)
    }

    if (this.rotate) {
      mat4.rotateX(world, world, this.rotate[0])
      mat4.rotateY(world, world, this.rotate[1])
      mat4.rotateZ(world, world, this.rotate[2])
    }

    if (this.scale) {
      mat4.scale(world, world, this.scale)
    }

    uniforms.u_world = world

    // Populate u_worldInverseTranspose - used for normals & shading
    mat4.invert(<mat4>uniforms.u_worldInverseTranspose, world)
    mat4.transpose(<mat4>uniforms.u_worldInverseTranspose, <mat4>uniforms.u_worldInverseTranspose)

    // Populate u_worldViewProjection which is pretty fundamental
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, viewProjection, world)

    for (const part of this.model.parts) {
      const bufferInfo = part.bufferInfo

      const material = this.model.materials[part.materialName]
      material.apply(programInfo)

      setBuffersAndAttributes(gl, programInfo, bufferInfo)
      setUniforms(programInfo, uniforms)

      drawBufferInfo(gl, bufferInfo)
    }
  }
}
