// ===== types.ts =======================================================
// Simple types used in the engine
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'
import { ProgramInfo } from 'twgl.js'

export type UniformSet = { [key: string]: number | number[] | mat4 | WebGLTexture | null }

export type XYZ = [number, number, number]
export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]

/**
 * Models and primitives implement this interface to be rendered
 */
export interface Renderable {
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo)
}
