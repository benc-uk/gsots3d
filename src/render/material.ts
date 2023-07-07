// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB, UniformSet, MtlMaterial } from '../core/types.ts'

const UNIFORM_PREFIX = 'u_mat'

export class Material {
  public diffuse?: RGB
  public specular?: RGB
  public shininess?: number
  public ambient?: RGB
  public emissive?: RGB

  /**
   * Create a new material with default diffuse colour
   */
  constructor() {
    this.diffuse = [0.2, 0.5, 0.97]
    this.specular = undefined
    this.shininess = undefined
    this.ambient = undefined
    this.emissive = undefined
  }

  /**
   * Create a new material from a raw MTL material
   */
  public static fromMtl(rawMtl: MtlMaterial) {
    const m = new Material()

    m.diffuse = rawMtl.kd
    m.specular = rawMtl.ks
    m.shininess = rawMtl.ns
    m.ambient = rawMtl.ka
    m.emissive = rawMtl.ke

    return m
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   */
  public apply(programInfo: ProgramInfo) {
    const uniforms = this.getUniforms()

    setUniforms(programInfo, uniforms)
  }

  /**
   * Return a map of uniforms for this light, with a prefix
   */
  public getUniforms(): UniformSet {
    const uniforms = {} as UniformSet

    for (const [propName, propValue] of Object.entries(this)) {
      if (propValue !== undefined) {
        uniforms[`${UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = propValue
      }
    }

    return uniforms
  }
}
