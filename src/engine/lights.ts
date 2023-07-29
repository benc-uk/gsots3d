// ===== light.ts =============================================================
// All light types directional and point
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Colours, Tuples, XYZ, RGB } from './tuples.ts'

/**
 * A directional light source, typically global with the context having only a single instance
 */
export class LightDirectional {
  /**
   * Direction vector (normalized) of the light in world space
   * @default [0, -1, 0]
   */
  private _direction: XYZ

  /**
   * Colour of the light, used for both diffuse and specular
   * @default [1, 1, 1]
   */
  public colour: RGB

  /**
   * Ambient colour of the light
   * @default [0, 0, 0]
   */
  public ambient: RGB

  /**
   * Is this light enabled
   * @default true
   */
  public enabled: boolean

  /** Create a default directional light, pointing downward */
  constructor() {
    this._direction = [0, -1, 0]
    this.colour = Colours.WHITE
    this.ambient = Colours.BLACK
    this.enabled = true
  }

  /**
   * Set the direction of the light ensuring it is normalized
   */
  set direction(d: XYZ) {
    // Ensure direction is normalized
    this._direction = Tuples.normalize(d)
  }

  /**
   * Get the direction of the light
   */
  get direction(): XYZ {
    return this._direction
  }

  /**
   * Convenience method allows setting the direction as a point relative to the world origin
   */
  setAsPosition(x: number, y: number, z: number) {
    this._direction = Tuples.normalize([0 - x, 0 - y, 0 - z])
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
      colour: this.enabled ? this.colour : [0, 0, 0],
      ambient: this.ambient ? this.ambient : [0, 0, 0],
    } as UniformSet
  }
}

/*
 * A point light source, typically local to a model or scene
 */
export class LightPoint {
  /*
   * Position of the light in world space
   * @default [0, 100, 0]
   */
  public position: XYZ

  /*
   * Colour of the light
   * @default [1, 1, 1]
   */
  public colour: RGB

  /**
   * Ambient colour of the light
   * @default [0, 0, 0]
   */
  public ambient: RGB

  /*
   * Attenuation constant drop off rate
   * @default 1.0
   */
  public constant: number

  /*
   * Attenuation linear drop off rate
   * @default 0.07
   */
  public linear: number

  /*
   * Attenuation quadratic drop off rate
   * @default 0.017
   */
  public quad: number

  /**
   * Is this light enabled
   * @default true
   */
  public enabled: boolean

  constructor(position: XYZ, colour: RGB) {
    this.position = position
    this.colour = colour

    this.enabled = true
    this.ambient = Colours.BLACK
    this.constant = 0.5
    this.linear = 0.018
    this.quad = 0.0003
  }

  /**
   * Applies the light to the given program as uniform struct
   */
  apply(programInfo: ProgramInfo, uniformSuffix = '') {
    const uni = {
      [`u_lightPos${uniformSuffix}`]: this.uniforms,
    }

    setUniforms(programInfo, uni)
  }

  /**
   * Return the base set of uniforms for this light
   */
  public get uniforms(): UniformSet {
    return {
      enabled: this.enabled,
      quad: this.quad,
      position: this.position,
      colour: this.colour,
      ambient: this.ambient,
      constant: this.constant,
      linear: this.linear,
    } as UniformSet
  }
}
