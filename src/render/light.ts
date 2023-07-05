// ===== light.ts =============================================================
// Simple class to hold a light source
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB, UniformSet, XYZ } from '../core/types.ts'

const UNIFORM_PREFIX = 'u_light'

export class Light {
  public position: XYZ
  public color: RGB
  public ambient: RGB

  constructor() {
    this.position = [0, 0, 0]
    this.color = [1, 1, 1]
    this.ambient = [0.1, 0.1, 0.1]
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_light`, e.g. `u_matPosition`
   */
  apply(programInfo: ProgramInfo) {
    const uniforms = this.getUniforms()

    setUniforms(programInfo, uniforms)
  }

  /**
   * Return a map of uniforms for this light, with a prefix
   */
  getUniforms(): UniformSet {
    const uniforms = {} as UniformSet

    for (const [propName, propValue] of Object.entries(this)) {
      if (propValue !== undefined) {
        uniforms[`${UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = propValue
      }
    }

    return uniforms
  }
}
