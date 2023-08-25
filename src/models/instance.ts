// ===== instance.ts ==========================================================
// Instance class, holds position, rotation, scale etc for a renderable
// Ben Coleman, 2023
// ============================================================================

import { mat4, quat } from 'gl-matrix'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { XYZ, XYZW } from '../engine/tuples.ts'
import { ProgramInfo } from 'twgl.js'

/**
 * An instance of thing in the world to be rendered, with position, rotation, scale etc
 */
export class Instance {
  /** Main renderable thing this instance represents */
  public readonly renderable: Renderable | undefined

  /** Position in world space */
  public position: XYZ

  /** Post translation in world space, applied after main pos + scale + rotate */
  public postTranslate: XYZ | undefined

  /** Scale in world space */
  public scale: XYZ

  private quaternion: quat

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

  /** Should this instance receive shadows */
  private receiveShadow = true

  public readonly id: number

  /**
   * Create a new instace of a renderable thing
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable: Renderable) {
    // TODO: This is a plain straight up lazy hack
    this.id = Math.random()

    this.renderable = renderable

    this.position = [0, 0, 0]
    this.scale = [1, 1, 1]
    this.quaternion = quat.create()
  }

  setPosition(x: number | XYZ, y?: number, z?: number) {
    if (x instanceof Array) {
      this.position = x
      return
    }

    if (y === undefined || z === undefined) throw new Error('setPosition requires either an array or 3 numbers')

    this.position = [x, y, z]
  }

  /** Rotate this instance around the X, Y and Z axis in radians */
  rotate(ax: number, ay: number, az: number) {
    quat.rotateX(this.quaternion, this.quaternion, ax)
    quat.rotateY(this.quaternion, this.quaternion, ay)
    quat.rotateZ(this.quaternion, this.quaternion, az)
  }

  /** Rotate this instance around the X axis*/
  rotateX(angle: number) {
    quat.rotateX(this.quaternion, this.quaternion, angle)
  }

  /** Rotate this instance around the Y axis*/
  rotateY(angle: number) {
    quat.rotateY(this.quaternion, this.quaternion, angle)
  }

  /** Rotate this instance around the Z axis, in radians*/
  rotateZ(angle: number) {
    quat.rotateZ(this.quaternion, this.quaternion, angle)
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

  /** Set the rotation quaternion directly, useful to integrate with physics system */
  setQuaternion(quatArray: XYZW) {
    this.quaternion = quat.fromValues(quatArray[0], quatArray[1], quatArray[2], quatArray[3])
  }

  /** Get the rotation quaternion as a XYZW 4-tuple */
  getQuaternion(): XYZW {
    return [this.quaternion[0], this.quaternion[1], this.quaternion[2], this.quaternion[3]]
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

    const world = mat4.create()

    // Main world (also called model) matrix, used for positioning, scaling, rotation this instance
    mat4.fromRotationTranslationScale(world, this.quaternion, this.position, this.scale)

    // Clumsy hack to allow post translation of instances
    if (this.postTranslate) {
      mat4.translate(world, world, this.postTranslate)
    }

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

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Render the renderable thing wrapped by this instance
    this.renderable.render(gl, uniforms, this.material, programOverride)
  }
}
