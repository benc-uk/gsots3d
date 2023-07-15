// ===== models/model.ts ======================================================
// Instance class, holds a model and position, rotation, scale etc
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { ProgramInfo } from 'twgl.js'
import { Renderable, UniformSet } from '../core/types.ts'
import { Material } from '../render/material.ts'

/**
 * An instance of thing in the world to be rendered, with position, rotation, scale etc
 */
export class Instance {
  public readonly renderable: Renderable | undefined
  public position: [number, number, number] | undefined
  public scale: [number, number, number] | undefined
  public rotate: [number, number, number] | undefined

  /**
   * Material to use for this instance, this will override ALL the materials on the model!
   * Really only useful for simple untextured models without a MTL file
   */
  public material?: Material

  /**
   * @param {Model} model - Model to use for this instance
   */
  constructor(renderable: Renderable) {
    this.renderable = renderable
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
   * Render this instance in the world
   * @param {WebGL2RenderingContext} gl - WebGL context to render into
   * @param {UniformSet} uniforms - Map of uniforms to pass to shader
   * @param {mat4} viewProjection - View projection matrix
   * @param {ProgramInfo} programInfo - Shader program info
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, viewProjection: mat4, programInfo: ProgramInfo) {
    if (!this.renderable) return
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

    // Really important, for normals & lighting
    uniforms.u_world = world

    // Populate u_worldInverseTranspose - used for normals & shading
    mat4.invert(<mat4>uniforms.u_worldInverseTranspose, world)
    mat4.transpose(<mat4>uniforms.u_worldInverseTranspose, <mat4>uniforms.u_worldInverseTranspose)

    // Populate u_worldViewProjection which is pretty fundamental
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, viewProjection, world)

    // Render the renderable thing wrapped by this instance
    this.renderable.render(gl, uniforms, programInfo, this.material)
  }
}
