// ===== instance.ts ==========================================================
// Instance class, holds position, rotation, scale etc for a renderable
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { XYZ } from '../engine/tuples.ts'
import { ProgramInfo } from 'twgl.js'
import { Node } from '../engine/node.ts'

/**
 * An instance of thing in the world to be rendered, with position, rotation, scale etc
 */
export class Instance extends Node {
  /** Main renderable thing this instance represents */
  public readonly renderable: Renderable | undefined

  /** Flip all textures on this instance on the X axis */
  public flipTextureX = false

  /** Flip all textures on this instance on the Y axis */
  public flipTextureY = false

  /** Material override. This will override the renderable's material.
   *  This is only useful on simple models that probably consist of one surface */
  public material?: Material

  /** Override just some material properties, warning advanced feature! */
  public uniformOverrides?: UniformSet

  /**
   * Create a new instace of a renderable thing
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable: Renderable) {
    super()
    this.renderable = renderable
  }

  setPosition(x: number | XYZ, y?: number, z?: number) {
    if (x instanceof Array) {
      this.position = x
      return
    }

    if (y === undefined || z === undefined) throw new Error('setPosition requires either an array or 3 numbers')

    this.position = [x, y, z]
  }

  /**
   * Render this instance in the world, called internally by the context when rendering
   * @param {WebGL2RenderingContext} gl - WebGL context to render into
   * @param {UniformSet} uniforms - Map of uniforms to pass to shader
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programOverride?: ProgramInfo) {
    if (!this.enabled) return
    if (!this.renderable) return
    if (!gl) return

    // HACK: As programOverride is CURRENTLY only used for shadow map rendering
    // We need a better way to to know if we are rendering a shadow map!!
    if (programOverride && !this.castShadow) {
      return
    }

    const world = this.modelMatrix

    // Populate u_world - used for normals & shading
    uniforms.u_world = world

    // Populate u_worldInverseTranspose - used for normals & shading
    mat4.invert(<mat4>uniforms.u_worldInverseTranspose, world)
    mat4.transpose(<mat4>uniforms.u_worldInverseTranspose, <mat4>uniforms.u_worldInverseTranspose)

    // Create worldView matrix, used for positioning
    const worldView = mat4.multiply(mat4.create(), <mat4>uniforms.u_view, world)

    // Finally populate u_worldViewProjection used for rendering
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, <mat4>uniforms.u_proj, worldView)

    // Apply per instance uniforms for the shader
    uniforms.u_flipTextureX = this.flipTextureX
    uniforms.u_flipTextureY = this.flipTextureY
    uniforms.u_receiveShadow = this.receiveShadow
    if (this.uniformOverrides) uniforms = { ...uniforms, ...this.uniformOverrides }

    // Render the renderable thing wrapped by this instance
    this.renderable.render(gl, uniforms, this.material, programOverride)
  }
}
