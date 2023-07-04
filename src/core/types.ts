// ===== types.ts =======================================================
// Simple types used in the engine
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'

export type UniformSet = { [key: string]: number | number[] | mat4 }

export type Geometry = {
  material: string
  data: {
    position: number[]
    texcoord?: number[]
    normal: number[]
  }
}
