// ===== types.ts =======================================================
// Simple types used in the engine
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'
import { ProgramInfo } from 'twgl.js'

/** A map of uniforms that can be used when WebGL rendering, typically applied with twlg.setUniforms() */
export type UniformSet = { [key: string]: number | number[] | mat4 | WebGLTexture | null }

/** A simple 3D position or vector tuple */
export type XYZ = [number, number, number]

/** A simple RGB colour tuple */
export type RGB = [number, number, number]

/** A simple RGBA colour tuple */
export type RGBA = [number, number, number, number]

/**
 * Models and primitives implement this interface to be rendered
 */
export interface Renderable {
  /**
   * Called to render this render-able thing
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo): void
}

/**
 * The set of supported shader programs that can be used
 */
export enum ShaderProgram {
  PHONG = 'phong',
  GOURAUD = 'gouraud',
}
