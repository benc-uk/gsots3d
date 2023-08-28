// ======== primitive.ts ======================================================
// Main model class, holds a list of parts, each with a material
// Models are parsed from OBJ files
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Material } from '../engine/material.ts'

/**
 * Models and primitives implement this interface to be rendered
 */
export interface Renderable {
  /** Called to render this render-able thing */
  render(
    gl: WebGL2RenderingContext,
    uniforms: UniformSet,
    materialOverride?: Material,
    programOverride?: ProgramInfo,
  ): void
}
