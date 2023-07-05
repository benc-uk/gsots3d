// ===== types.ts =======================================================
// Simple types used in the engine
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'

export type UniformSet = { [key: string]: number | number[] | mat4 }

export type XYZ = [number, number, number]
export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]

export type Geometry = {
  material: string
  data: {
    position: number[]
    texcoord?: number[]
    normal: number[]
  }
}
