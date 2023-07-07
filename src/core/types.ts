// ===== types.ts =======================================================
// Simple types used in the engine
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'
import { ProgramInfo } from 'twgl.js'

export type UniformSet = { [key: string]: number | number[] | mat4 | WebGLTexture }

export type XYZ = [number, number, number]
export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]

/**
 * Models and primitives implement this interface to be rendered
 */
export interface Renderable {
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo)
}

// Stolen from lib.dom.d.ts

/** @ignore */
export const TEX_NEAREST = 0x2600
/** @ignore */
export const TEX_LINEAR = 0x2601
/** @ignore */
export const TEX_NEAREST_MIPMAP_NEAREST = 0x2700
/** @ignore */
export const TEX_LINEAR_MIPMAP_NEAREST = 0x2701
/** @ignore */
export const TEX_NEAREST_MIPMAP_LINEAR = 0x2702
/** @ignore */
export const TEX_LINEAR_MIPMAP_LINEAR = 0x2703
