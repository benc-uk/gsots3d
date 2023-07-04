import { mat4 } from 'gl-matrix'

export type UniformSet = { [key: string]: number | number[] | mat4 }
