// ===== logging.ts ===========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { MtlMaterial } from '../parsers/mtl-parser.ts'

const UNIFORM_PREFIX = 'u_mat'

export class Material {
  private diffuse?: number[]
  private specular?: number[]
  private shininess?: number
  private ambient?: number[]
  private emissive?: number[]

  constructor(matRaw: MtlMaterial) {
    this.diffuse = matRaw.kd
    this.specular = matRaw.ks
    this.shininess = matRaw.ns
    this.ambient = matRaw.ka
    this.emissive = matRaw.ke
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   */
  apply(programInfo: ProgramInfo) {
    const uniforms = {}

    for (const [propName, propValue] of Object.entries(this)) {
      if (propValue !== undefined) {
        uniforms[`${UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = propValue
      }
    }

    setUniforms(programInfo, uniforms)
  }
}
