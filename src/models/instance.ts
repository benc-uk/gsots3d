// ===== instance.ts ==========================================================
// Instance class, holds position, rotation, scale etc for a renderable
// Ben Coleman, 2023
// ============================================================================

import { mat4, vec3 } from 'gl-matrix'
import { ProgramInfo } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { XYZ } from '../engine/tuples.ts'

/** Billboarding modes, most things will ue NONE */
export enum BillboardType {
  NONE,
  SPHERICAL,
  CYLINDRICAL,
}

/**
 * An instance of thing in the world to be rendered, with position, rotation, scale etc
 */
export class Instance {
  public readonly renderable: Renderable | undefined
  public position: XYZ | undefined
  public scale: XYZ | undefined
  public rotate: XYZ | undefined
  public enabled = true

  /**
   * If this instance is to be drawn as a billboard, and what type
   * @see BillboardType
   * @default BillboardType.NONE
   */
  public billboard: BillboardType | undefined

  /**
   * Material to use for this instance, this will override ALL the materials on the model!
   * Really only useful for simple untextured models without a MTL file
   */
  public material?: Material

  /**
   * Per instance texture flip flags, useful for flipping textures on a per instance basis
   * @default false
   */
  public flipTextureX = false

  /**
   * Per instance texture flip flags, useful for flipping textures on a per instance basis
   * @default false
   */
  public flipTextureY = false

  /**
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable: Renderable) {
    this.billboard = BillboardType.NONE
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

  rotateZDeg(angle: number) {
    this.rotateZ((angle * Math.PI) / 180)
  }

  rotateYDeg(angle: number) {
    this.rotateY((angle * Math.PI) / 180)
  }

  rotateXDeg(angle: number) {
    this.rotateX((angle * Math.PI) / 180)
  }

  /**
   * Render this instance in the world
   * @param {WebGL2RenderingContext} gl - WebGL context to render into
   * @param {UniformSet} uniforms - Map of uniforms to pass to shader
   * @param {mat4} viewProjection - View projection matrix
   * @param {ProgramInfo} programInfo - Shader program info
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo) {
    if (!this.enabled) return
    if (!this.renderable) return
    if (!gl) return

    // Not a big fan of having this set per instance, but will billboarding we need to
    gl.useProgram(programInfo.program)

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

    if (this.billboard !== BillboardType.NONE) {
      // Extract scale from worldView matrix, before we zap it
      const scale = mat4.getScaling(vec3.create(), worldView)

      // For CYLINDRICAL billboarding, we need to remove some parts of the worldView matrix
      // See: https://www.geeks3d.com/20140807/billboarding-vertex-shader-glsl/
      worldView[0] = scale[0]
      worldView[1] = 0
      worldView[2] = 0
      worldView[8] = 0
      worldView[9] = 0
      worldView[10] = scale[2]

      if (this.billboard === BillboardType.SPHERICAL) {
        // For SPHERICAL billboarding, we remove some more
        worldView[4] = 0
        worldView[5] = scale[1]
        worldView[6] = 0
      }
    }

    // Finally populate u_worldViewProjection used for rendering
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, <mat4>uniforms.u_proj, worldView)

    // Apply per instance texture flip flags
    uniforms.u_flipTextureX = this.flipTextureX
    uniforms.u_flipTextureY = this.flipTextureY

    // Render the renderable thing wrapped by this instance
    this.renderable.render(gl, uniforms, programInfo, this.material)
  }
}
