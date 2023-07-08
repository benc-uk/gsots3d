// ===== light.ts =============================================================
// Simple class to hold a light source
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB, UniformSet, XYZ } from '../core/types.ts'

const UNIFORM_PREFIX = 'u_light'

export class Light {
  public position: XYZ
  public colour: RGB

  constructor() {
    this.position = [0, 0, 0]
    this.colour = [1, 1, 1]
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_light`, e.g. `u_matPosition`
   */
  apply(programInfo: ProgramInfo) {
    setUniforms(programInfo, this.Uniforms)
  }

  /**
   * Return a map of uniforms for this light, with a prefix
   */
  public get Uniforms(): UniformSet {
    return {
      [`${UNIFORM_PREFIX}Position`]: [...this.position, 1],
      [`${UNIFORM_PREFIX}Colour`]: [...this.colour, 1],
    }
  }
}
