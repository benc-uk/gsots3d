// ===== billboard.ts =========================================================
// For drawing 2D billboards, like trees, grass, etc
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms, primitives, BufferInfo } from 'twgl.js'

import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { mat4 } from 'gl-matrix'
import { stats } from '../core/stats.ts'

export class Billboard implements Renderable {
  protected bufferInfo: BufferInfo | undefined
  public material: Material
  public tex: WebGLTexture | undefined

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.material = new Material()

    const transform = mat4.create()
    mat4.rotateX(transform, transform, Math.PI / 2)

    this.bufferInfo = primitives.createPlaneBufferInfo(gl, width, height, 1, 1, transform)
  }

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
