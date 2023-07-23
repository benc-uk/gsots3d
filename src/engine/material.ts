// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB } from './tuples.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { UniformSet } from '../core/gl.ts'
import { textureCache } from '../core/context.ts'

export class Material {
  /**
   * Ambient colour will be multiplied with the ambient light level & colour
   */
  public ambient: RGB

  /**
   * Diffuse colour will be multiplied with the diffuse texture
   * @default [1, 1, 1]
   */
  public diffuse: RGB

  /**
   * Specular colour will be multiplied with the specular texture
   * @default [0, 0, 0]
   */
  public specular: RGB

  /**
   * Emissive colour will be added to the final colour, use for glowing materials
   */
  public emissive: RGB

  /**
   * Shininess, for size of specular highlights
   * @default 0
   */
  public shininess: number

  /**
   * Opacity, 0.0 to 1.0
   * @default 1.0
   */
  public opacity: number

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
    this.ambient = [1, 1, 1]
    this.diffuse = [1, 1, 1]
    this.specular = [0, 0, 0]
    this.emissive = [0, 0, 0]

    this.shininess = 0
    this.opacity = 1.0

    // 1 pixel white texture allows for solid colour materials
    this.diffuseTex = textureCache.get('_defaults/white')
    this.specularTex = textureCache.get('_defaults/white')
  }

  /**
   * Create a new material from a raw MTL material
   */
  public static fromMtl(rawMtl: MtlMaterial, basePath: string, filter = true, flipY = true) {
    const m = new Material()

    m.ambient = rawMtl.ka ? rawMtl.ka : [1, 1, 1]
    m.diffuse = rawMtl.kd ? rawMtl.kd : [1, 1, 1]
    m.specular = rawMtl.ks ? rawMtl.ks : [0, 0, 0]
    m.emissive = rawMtl.ke ? rawMtl.ke : [0, 0, 0]
    m.shininess = rawMtl.ns ? rawMtl.ns : 0
    m.opacity = rawMtl.d ? rawMtl.d : 1.0

    if (rawMtl.texDiffuse) {
      m.diffuseTex = textureCache.getCreate(`${basePath}/${rawMtl.texDiffuse}`, filter, flipY)
    }

    if (rawMtl.texSpecular) {
      m.specularTex = textureCache.getCreate(`${basePath}/${rawMtl.texSpecular}`, filter, flipY)
    }

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
  public static createBasicTexture(url: string, filter = true, flipY = false) {
    const m = new Material()

    m.diffuseTex = textureCache.getCreate(url, filter, flipY)

    return m
  }

  /**
   * Add a specular texture map to existing material, probably created with createBasicTexture
   * @param url
   * @param filter
   */
  public addSpecularTexture(url: string, filter = true, flipY = false) {
    this.specularTex = textureCache.getCreate(url, filter, flipY)
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

  /** Create a simple BLUE Material */
  static get WHITE() {
    const m = Material.createSolidColour(1.0, 1.0, 1.0)

    return m
  }

  /**
   * Applies the material to the given program as a uniform struct
   */
  apply(programInfo: ProgramInfo, uniformSuffix = '') {
    const uni = {
      [`u_mat${uniformSuffix}`]: this.uniforms,
    }

    setUniforms(programInfo, uni)
  }

  /**
   * Return the base set of uniforms for this material
   */
  public get uniforms(): UniformSet {
    return {
      ambient: this.ambient,
      diffuse: this.diffuse,
      specular: this.specular,
      emissive: this.emissive,
      shininess: this.shininess,
      opacity: this.opacity,
      diffuseTex: this.diffuseTex ? this.diffuseTex : null,
      specularTex: this.specularTex ? this.specularTex : null,
    } as UniformSet
  }
}
