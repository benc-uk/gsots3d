// ===== light.ts =============================================================
// All light types directional and point
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB, UniformSet, XYZ } from '../core/types.ts'
import { normalize3Tuple } from '../utils/vecmat.ts'

/**
 * A directional light source, typically global with the context having a single instance
 */
export class LightDirectional {
  /**
   * Direction of the light in world space
   * @default [0, -1, 0]
   */
  private _direction: XYZ

  /**
   * Colour of the light
   * @default [1, 1, 1]
   */
  public colour: RGB

  /** Create a default directional light, pointing downward */
  constructor() {
    this._direction = [0, -1, 0]
    this.colour = [1, 1, 1]
  }

  set direction(d: XYZ) {
    // Ensure direction is normalized
    this._direction = normalize3Tuple(d)
  }

  get direction(): XYZ {
    return this._direction
  }

  /**
   * Convenience method allows setting the direction as a point relative to the world origin
   */
  setAsPosition(x: number, y: number, z: number) {
    this._direction = normalize3Tuple([0 - x, 0 - y, 0 - z])
  }

  /**
   * Applies the light to the given program as uniform struct
   */
  apply(programInfo: ProgramInfo, uniformSuffix = '') {
    const uni = {
      [`u_lightDir${uniformSuffix}`]: this.uniforms,
    }

    setUniforms(programInfo, uni)
  }

  /**
   * Return the base set of uniforms for this light
   */
  public get uniforms(): UniformSet {
    return {
      direction: this.direction,
      colour: this.colour,
    } as UniformSet
  }
}
