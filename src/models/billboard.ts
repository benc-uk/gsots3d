// ===== billboard.ts =========================================================
// For drawing 2D billboards, like trees, grass, etc
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms, primitives, BufferInfo } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { stats } from '../core/stats.ts'
import { ProgramCache } from '../index.ts'
import { mat4, vec3 } from 'gl-matrix'

/** Billboarding modes, most things will ue NONE */
export enum BillboardType {
  SPHERICAL,
  CYLINDRICAL,
}

/**
 * A simple 2D billboard, like a tree or grass. These are square by default, but can be scaled XY if needed.
 * Both cylindrical and spherical billboards are supported. You must assign material with a texture
 * to be rendered as a sprite on the billboard
 * @see http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
 */
export class Billboard implements Renderable {
  protected bufferInfo: BufferInfo
  private programInfo: ProgramInfo
  public material: Material
  public tex: WebGLTexture | undefined
  public type: BillboardType = BillboardType.CYLINDRICAL

  /** Creates a square billboard */
  constructor(gl: WebGL2RenderingContext, type: BillboardType, material: Material, size: number) {
    this.material = material
    this.bufferInfo = primitives.createXYQuadBufferInfo(gl, size, 0, size / 2)
    this.programInfo = ProgramCache.instance.get(ProgramCache.PROG_BILLBOARD)
    this.type = type
  }

  /**
   * Render is used draw this billboard, this is called from the Instance that wraps
   * this renderable
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, materialOverride?: Material | undefined): void {
    gl.useProgram(this.programInfo.program)

    if (materialOverride === undefined) {
      this.material.apply(this.programInfo)
    } else {
      materialOverride.apply(this.programInfo)
    }

    // We're doubling up on work done in the Instance class here, hard to get around this
    const worldView = mat4.multiply(mat4.create(), <mat4>uniforms.u_view, <mat4>uniforms.u_world)

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

    if (this.type == BillboardType.SPHERICAL) {
      // For SPHERICAL billboarding, we remove some more
      worldView[4] = 0
      worldView[5] = scale[1]
      worldView[6] = 0
    }

    // We're doubling up on work again :/
    mat4.multiply(<mat4>uniforms.u_worldViewProjection, <mat4>uniforms.u_proj, worldView)

    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
    setUniforms(this.programInfo, uniforms)

    drawBufferInfo(gl, this.bufferInfo)
    stats.drawCallsPerFrame++
  }
}
