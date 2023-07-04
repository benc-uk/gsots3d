// ===== light.ts =============================================================
// Simple class to hold a light source
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { UniformSet } from '../core/types.ts'

const UNIFORM_PREFIX = 'u_light'

export class Light {
  public position: [number, number, number] = [0, 0, 0]
  public color: [number, number, number] = [1, 1, 1]
  public ambient: [number, number, number] = [0.1, 0.1, 0.1]

  constructor() {
    // Empty
  }

  // Apply this light to a shader program
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
