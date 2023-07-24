// ===== billboard.ts =========================================================
// For drawing 2D billboards, like trees, grass, etc
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms, primitives, BufferInfo } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { stats } from '../core/stats.ts'

/**
 * A simple 2D billboard, like a tree or grass. These are square by default, but can be scaled XY if needed.
 * Both cylindrical and spherical billboards are supported. You must assign material with a texture
 * to be rendered on the billboard
 * @see http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
 */
export class Billboard implements Renderable {
  protected bufferInfo: BufferInfo | undefined
  public material: Material
  public tex: WebGLTexture | undefined

  /** Creates a square billboard */
  constructor(gl: WebGL2RenderingContext, size: number) {
    this.material = new Material()

    this.bufferInfo = primitives.createXYQuadBufferInfo(gl, size, 0, size / 2)
  }

  /** Render the billboard */
  render(
    gl: WebGL2RenderingContext,
    uniforms: UniformSet,
    programInfo: ProgramInfo,
    materialOverride?: Material | undefined
  ): void {
    if (!this.bufferInfo) return

    if (materialOverride === undefined) {
      this.material.apply(programInfo)
    } else {
      materialOverride.apply(programInfo)
    }

    setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
    setUniforms(programInfo, uniforms)

    drawBufferInfo(gl, this.bufferInfo)
    stats.drawCallsPerFrame++
  }
}
