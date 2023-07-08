// ===== light.ts =============================================================
// A point light source
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB, UniformSet, XYZ } from '../core/types.ts'

const UNIFORM_PREFIX = 'u_light'

export class Light {
  /**
   * Position of the light in world space
   * @default [0, 0, 0]
   */
  public position: XYZ

  /**
   * Colour of the light
   * @default [1, 1, 1]
   */
  public colour: RGB

  /**
   * Intensity of the light
   * @default 1.0
   */
  public intensity: number

  /** Create a new default light */
  constructor() {
    this.position = [0, 0, 0]
    this.colour = [1, 1, 1]
    this.intensity = 1.0
  }

  /**
   * Applies the light to the given program as a set of uniforms
   * Each uniform is prefixed with `u_light`, e.g. `u_lightPosition`
   */
  apply(programInfo: ProgramInfo) {
    setUniforms(programInfo, this.Uniforms)
  }

  /** Return a map of uniforms for this light, with a prefix */
  public get Uniforms(): UniformSet {
    return {
      [`${UNIFORM_PREFIX}Position`]: [...this.position, 1],
      [`${UNIFORM_PREFIX}Colour`]: [...this.colour, 1],
    }
  }
}
