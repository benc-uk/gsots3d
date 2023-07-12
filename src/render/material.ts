// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, createTexture, setUniforms } from 'twgl.js'
import { RGB, UniformSet } from '../core/types.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { getGl } from '../core/gl.ts'

const UNIFORM_PREFIX = 'u_mat'

export class Material {
  /**
   * Diffuse colour will be multiplied with the diffuse texture
   * @default [1, 1, 1]
   */
  public diffuse?: RGB

  /**
   * Specular colour will be multiplied with the specular texture
   * @default [0, 0, 0]
   */
  public specular?: RGB

  /**
   * Shininess, for size of specular highlights
   * @default 0
   */
  public shininess?: number

  /**
   * Ambient colour will be multiplied with the ambient light level & colour
   */
  public ambient?: RGB

  /**
   * Emissive colour will be used for glowing material. NOT IMPLEMENTED!
   * @default undefined
   * @notImplemented
   */
  public emissive?: RGB

  /**
   * Diffuse texture map
   * @default "1 pixel white texture"
   */
  public diffuseTex?: WebGLTexture

  /**
   * Specular texture map
   * @default "1 pixel white texture"
   */
  public specularTex?: WebGLTexture

  /**
   * Create a new material with default diffuse colour
   */
  constructor() {
    this.diffuse = [1, 1, 1]
    this.specular = [0, 0, 0]
    this.shininess = 0
    this.ambient = [1, 1, 1]
    this.emissive = undefined

    const gl = getGl()
    if (!gl) return

    // 1 pixel white texture allows for solid colour materials
    this.diffuseTex = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255],
    })

    this.specularTex = createTexture(gl, {
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
   * Create a basic Material with a solid diffuse colour
   */
  public static createSolidColour(r: number, g: number, b: number) {
    const m = new Material()
    m.diffuse = [r, g, b]

    return m
  }

  /**
   * Create a new Material with a texture map loaded from a URL
   */
  public static createBasicTexture(url: string, filter = true) {
    const m = new Material()
    const gl = getGl()
    if (!gl) return m

    gl.LINEAR_MIPMAP_LINEAR
    m.diffuseTex = createTexture(gl, {
      min: filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST,
      mag: filter ? gl.LINEAR : gl.NEAREST,
      src: url,
    })

    return m
  }

  public addSpecularTexture(url: string, filter = true) {
    const gl = getGl()
    if (!gl) return

    this.specularTex = createTexture(gl, {
      min: filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST,
      mag: filter ? gl.LINEAR : gl.NEAREST,
      src: url,
    })
  }

  /** Create a simple RED Material */
  static get RED() {
    const m = Material.createSolidColour(1.0, 0.0, 0.0)
    return m
  }

  /** Create a simple GREEN Material */
  static get GREEN() {
    return Material.createSolidColour(0.0, 1.0, 0.0)
  }

  /** Create a simple BLUE Material */
  static get BLUE() {
    const m = Material.createSolidColour(0.0, 0.0, 1.0)

    return m
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   */
  public apply(programInfo: ProgramInfo) {
    setUniforms(programInfo, this.uniforms)
  }

  /**
   * Return a map of uniforms for this material, with a prefix
   */
  public get uniforms(): UniformSet {
    return {
      [`${UNIFORM_PREFIX}DiffuseTex`]: this.diffuseTex ? this.diffuseTex : null,
      [`${UNIFORM_PREFIX}SpecularTex`]: this.specularTex ? this.specularTex : null,
      [`${UNIFORM_PREFIX}Shininess`]: this.shininess ? this.shininess : 0,
      [`${UNIFORM_PREFIX}Diffuse`]: this.diffuse ? [...this.diffuse, 1] : [1, 1, 1, 1],
      [`${UNIFORM_PREFIX}Specular`]: this.specular ? [...this.specular, 1] : [0, 0, 0, 1],
      [`${UNIFORM_PREFIX}Ambient`]: this.ambient ? [...this.ambient, 1] : [1, 1, 1, 1],
    } as UniformSet
  }
}
