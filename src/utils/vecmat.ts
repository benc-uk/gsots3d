import { RGB, RGBA, XYZ } from '../core/types.ts'

export function normalize3Tuple(tuple: XYZ | RGB | number[]) {
  const [x, y, z] = tuple
  const len = Math.sqrt(x * x + y * y + z * z)

  return tuple.map((v) => v / len) as XYZ
}

export function scaleTuple(tuple: XYZ | RGB | RGBA | number[], scale: number) {
  return tuple.map((v) => v * scale) as XYZ
}
