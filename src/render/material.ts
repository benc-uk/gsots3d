// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, createTexture, setUniforms } from 'twgl.js'
import { RGB, TEX_LINEAR_MIPMAP_LINEAR, UniformSet } from '../core/types.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { getGl } from '../core/gl.ts'

const UNIFORM_PREFIX = 'u_mat'

export class Material {
  public diffuse?: RGB
  public specular?: RGB
  public shininess?: number
  public ambient?: RGB
  public emissive?: RGB

  public texture?: WebGLTexture

  /**
   * Create a new material with default diffuse colour
   */
  constructor() {
    this.diffuse = [1, 1, 1]
    this.specular = undefined
    this.shininess = undefined
    this.ambient = undefined
    this.emissive = undefined

    const gl = getGl()
    if (!gl) return

    // Solid white texture for plain colours
    this.texture = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255],
    })
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
   * Helper to create a new material with a solid diffuse colour
   */
  public static createDiffuse(r: number, g: number, b: number) {
    const m = new Material()
    m.diffuse = [r, g, b]

    return m
  }

  /**
   * Helper to create a new material with an image texture
   */
  public static createTexture(url: string, filter = true) {
    const m = new Material()
    const gl = getGl()
    if (!gl) return m

    gl.LINEAR_MIPMAP_LINEAR
    m.texture = createTexture(gl, {
      min: filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST,
      mag: filter ? gl.LINEAR : gl.NEAREST,
      src: url,
    })

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
        // Textures & scalar values are passed in as-is
        if (propName === 'texture' || propName === 'shininess') {
          uniforms[`${UNIFORM_PREFIX}Texture`] = propValue
          continue
        }

        // Tuples are passed as a vec4 with alpha set to 1
        uniforms[`${UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = [...propValue, 1.0]
      }
    }

    //console.log('Uniforms', uniforms)

    return uniforms
  }
}
