import { ProgramInfo } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Material } from '../engine/material.ts'

/**
 * Models and primitives implement this interface to be rendered
 */
export interface Renderable {
  /**
   * Called to render this render-able thing
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo, materialOverride?: Material): void
}
