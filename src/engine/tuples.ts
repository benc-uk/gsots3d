// ===== tuples.ts ======================================================
// Types & helpers for 3-tuples, used for positions, vectors and colours
// Ben Coleman, 2023
// ======================================================================

import { vec3 } from 'gl-matrix'
import * as CANNON from 'cannon-es'

/** A simple 3D position or vector tuple */
export type XYZ = [number, number, number]

/** A simple 4D position or vector tuple */
export type XYZW = [number, number, number, number]

/** A simple RGB colour tuple */
export type RGB = [number, number, number]

/** A simple RGBA colour tuple */
export type RGBA = [number, number, number, number]

// ============================================================================
// Tuple helpers
// ============================================================================

/**
 * Normalizes a 3-tuple to a unit vector.
 * @param tuple The tuple to normalize
 */
function normalize(tuple: XYZ | RGB | number[]) {
  const [x, y, z] = tuple
  const len = Math.sqrt(x * x + y * y + z * z)

  return tuple.map((v) => v / len) as XYZ
}

/**
 * Scales a 3-tuple by a scalar.
 * @param tuple The tuple to scale
 * @param scale The scalar to scale by
 */
function scale(tuple: XYZ | RGB | RGBA | number[], amount: number) {
  return tuple.map((v) => v * amount) as XYZ
}

/**
 * Scales a 3-tuple by a scalar, clamping the result to 0-1.
 * @param tuple The tuple to scale
 * @param scale The scalar to scale by
 */
function scaleClamped(colour: RGB | RGBA, amount: number) {
  scale(colour, amount)

  // Clamp to 0-1
  return colour.map((v) => Math.min(Math.max(v, 0), 1)) as RGB | RGBA
}

/**
 * Converts a 3-tuple to a gl-matrix vec3
 * @param tuple The tuple to convert
 */
function toVec3(tuple: XYZ) {
  return vec3.fromValues(tuple[0], tuple[1], tuple[2])
}

/**
 * Calculates the distance between two 3-tuples
 * @param a First tuple
 * @param b Second tuple
 */
function distance(a: XYZ, b: XYZ) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

function add(a: XYZ, b: XYZ) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]] as XYZ
}

/**
 * Converts a Cannon.js vector or quaternion to a 3-tuple
 * @param v The Cannon.js vector or quaternion to convert
 */
export function fromCannon(v: CANNON.Vec3 | CANNON.Quaternion) {
  if (v instanceof CANNON.Vec3) {
    return [v.x, v.y, v.z] as XYZ
  }

  return [v.x, v.y, v.z, v.w] as XYZW
}

// ============================================================================
// Colour helpers
// ============================================================================

/**
 * Creates a RGB 3-tuple from 0-255 values.
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 */
function rgbColour255(r: number, g: number, b: number) {
  return [r / 255, g / 255, b / 255] as RGB
}

/**
 * Converts a hex string to an RGB 3-tuple.
 * @param hexString
 */
function rgbColourHex(hexString: string) {
  const hex = hexString.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return rgbColour255(r, g, b)
}

/**
 * A set of common colours as RGB tuples
 */
export const Colours = {
  RED: [1, 0, 0] as RGB,
  GREEN: [0, 1, 0] as RGB,
  BLUE: [0, 0, 1] as RGB,
  YELLOW: [1, 1, 0] as RGB,
  CYAN: [0, 1, 1] as RGB,
  MAGENTA: [1, 0, 1] as RGB,
  BLACK: [0, 0, 0] as RGB,
  WHITE: [1, 1, 1] as RGB,
}

// ============================================================================
// Exports
// ============================================================================

export const Tuples = {
  normalize,
  scale,
  scaleClamped,
  rgbColour255,
  rgbColourHex,
  toVec3,
  distance,
  fromCannon,
  add,
}
