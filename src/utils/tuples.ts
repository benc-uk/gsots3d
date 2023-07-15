import { RGB, RGBA, XYZ } from '../core/types.ts'

export function normalize3Tuple(tuple: XYZ | RGB | number[]) {
  const [x, y, z] = tuple
  const len = Math.sqrt(x * x + y * y + z * z)

  return tuple.map((v) => v / len) as XYZ
}

export function scaleTuple(tuple: XYZ | RGB | RGBA | number[], scale: number) {
  return tuple.map((v) => v * scale) as XYZ
}

export function scaleTupleClamped(colour: RGB | RGBA, scale: number) {
  scaleTuple(colour, scale)

  // Clamp to 0-1
  return colour.map((v) => Math.min(Math.max(v, 0), 1)) as RGB | RGBA
}

export const ZERO = [0, 0, 0] as XYZ
export const BLACK = [0, 0, 0] as RGB
export const WHITE = [1, 1, 1] as RGB
