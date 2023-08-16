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

/**
 * An instance of thing in the world to be rendered, with position, rotation, scale etc
 */
export class Instance {
  /** Main renderable thing this instance represents */
  public readonly renderable: Renderable | undefined

  /** Position in world space */
  public position: XYZ | undefined

  /** Scale in world space */
  public scale: XYZ | undefined

  /** Should this instance be rendered and drawn */
  public enabled = true

  /** Should this instance cast a shadow */
  public castShadow = true

  /** Flip all textures on this instance on the X axis */
  public flipTextureX = false

  /** Flip all textures on this instance on the Y axis */
  public flipTextureY = false

  /** Material override. This will override the renderable's material.
   *  This is only useful on simple models that probably consist of one surface */
  public material?: Material

  /** Metadata for this instance, can be used to store anything */
  public metadata: Record<string, string | number | boolean> = {}

  /** Rotation in radians around X, Y, Z axis */
  private rotate: XYZ | undefined

  /**
   * Create a new instace of a renderable thing
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable: Renderable) {
    this.renderable = renderable
  }

  /** Rotate this instance around the X axis*/
  rotateX(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[0] += angle
  }

  /** Rotate this instance around the Y axis*/
  rotateY(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[1] += angle
  }

  /** Rotate this instance around the Z axis, in radians*/
  rotateZ(angle: number) {
    if (!this.rotate) this.rotate = [0, 0, 0]
    this.rotate[2] += angle
  }

  /** Rotate this instance around the X axis by a given angle in degrees */
  rotateZDeg(angle: number) {
    this.rotateZ((angle * Math.PI) / 180)
  }

  /** Rotate this instance around the Y axis by a given angle in degrees */
  rotateYDeg(angle: number) {
    this.rotateY((angle * Math.PI) / 180)
  }

  /** Rotate this instance around the Z axis by a given angle in degrees */
  rotateXDeg(angle: number) {
    this.rotateX((angle * Math.PI) / 180)
  }

  /**
   * Render this instance in the world
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

    // Local instance transforms are applied in this order to form the world matrix
    const scale = mat4.create()
    const rotate = mat4.create()
    const translate = mat4.create()

    // Apply scale, rotate, translate in that order
    if (this.scale) mat4.scale(scale, scale, this.scale)
    if (this.rotate) {
      mat4.rotateX(rotate, rotate, this.rotate[0])
      mat4.rotateY(rotate, rotate, this.rotate[1])
      mat4.rotateZ(rotate, rotate, this.rotate[2])
    }
    if (this.position) mat4.translate(translate, translate, this.position)

    // Combine all transforms into world matrix, in reverse order
    const world = translate
    mat4.multiply(world, world, rotate)
    mat4.multiply(world, world, scale)

    // Populate u_world - used for normals & shading
    uniforms.u_world = world

    // Populate u_worldInverseTranspose - used for normals & shading
    mat4.invert(<mat4>uniforms.u_worldInverseTranspose, world)
    mat4.transpose(<mat4>uniforms.u_worldInverseTranspose, <mat4>uniforms.u_worldInverseTranspose)

    // Create worldView matrix, used for positioning
    const worldView = mat4.multiply(mat4.create(), <mat4>uniforms.u_view, world)

    // Finally populate u_worldViewProjection used for rendering
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, <mat4>uniforms.u_proj, worldView)

    // Apply per instance texture flip flags
    uniforms.u_flipTextureX = this.flipTextureX
    uniforms.u_flipTextureY = this.flipTextureY

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Render the renderable thing wrapped by this instance
    this.renderable.render(gl, uniforms, this.material, programOverride)
  }
}
