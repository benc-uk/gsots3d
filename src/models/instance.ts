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
  public position: [number, number, number] | undefined
  public scale: [number, number, number] | undefined
  public rotate: [number, number, number] | undefined
  public transparent = false

  /**
   * @param {Model} model - Model to use for this instance
   */
  constructor(model: Model) {
    this.model = model
  }

  /**
   * Rotate this instance around the X axis
   */
  rotateX(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[0] += angle
  }

  /**
   * Rotate this instance around the Y axis
   */
  rotateY(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[1] += angle
  }

  /**
   * Rotate this instance around the Z axis
   */
  rotateZ(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[2] += angle
  }

  /**
   * Render this instance
   * @param {WebGL2RenderingContext} gl - WebGL context to render into
   * @param {UniformSet} uniforms - Map of uniforms to pass to shader
   * @param {mat4} viewProjection - View projection matrix
   * @param {ProgramInfo} programInfo - Shader program info
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, viewProjection: mat4, programInfo: ProgramInfo) {
    if (!gl) return

    // Local instance transforms are applied in this order to form the world matrix
    const world = mat4.create()
    if (this.scale) {
      mat4.scale(world, world, this.scale)
    }

    if (this.position) {
      mat4.translate(world, world, this.position)
    }

    if (this.rotate) {
      mat4.rotateX(world, world, this.rotate[0])
      mat4.rotateY(world, world, this.rotate[1])
      mat4.rotateZ(world, world, this.rotate[2])
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
