// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, setUniforms } from 'twgl.js'
import { RGB } from './tuples.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { UniformSet } from '../core/gl.ts'
import { TextureCache } from '../core/cache.ts'

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
   * @default 20
   */
  public shininess: number

  /**
   * Opacity, 0.0 to 1.0
   * @default 1.0
   */
  public opacity: number

  /**
   * Reflectivity, 0.0 to 1.0
   * @default 0.0
   */
  public reflectivity: number

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
   * Normal texture map
   * @default "1 pixel white texture"
   */
  public normalTex?: WebGLTexture

  /**
   * Create a new material with default diffuse white colour
   */
  constructor() {
    this.ambient = [1, 1, 1]
    this.diffuse = [1, 1, 1]
    this.specular = [0, 0, 0]
    this.emissive = [0, 0, 0]

    this.shininess = 20
    this.opacity = 1.0
    this.reflectivity = 0.0

    // 1 pixel white texture allows for solid colour & flat materials
    this.diffuseTex = TextureCache.defaultWhite
    this.specularTex = TextureCache.defaultWhite
  }

  /**
   * Create a new material from a raw MTL material
   * @param rawMtl Raw MTL material
   * @param basePath Base path for locating & loading textures in MTL file
   * @param filter Apply texture filtering to textures, default: true
   * @param flipY Flip the Y axis of textures, default: false
   */
  static fromMtl(rawMtl: MtlMaterial, basePath: string, filter = true, flipY = false) {
    const m = new Material()

    m.ambient = rawMtl.ka ? rawMtl.ka : [1, 1, 1]
    m.diffuse = rawMtl.kd ? rawMtl.kd : [1, 1, 1]
    m.specular = rawMtl.ks ? rawMtl.ks : [0, 0, 0]
    m.emissive = rawMtl.ke ? rawMtl.ke : [0, 0, 0]
    m.shininess = rawMtl.ns ? rawMtl.ns : 0
    m.opacity = rawMtl.d ? rawMtl.d : 1.0

    if (rawMtl.texDiffuse) {
      m.diffuseTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texDiffuse}`, filter, flipY)
    }

    if (rawMtl.texSpecular) {
      m.specularTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texSpecular}`, filter, flipY)
    }

    if (rawMtl.texNormal) {
      m.normalTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texNormal}`, filter, flipY)
    }

    // This is a kludge, a guess; if illum is 3 or more and Ks is set, then we have
    // A reflective material of some kind
    if (rawMtl.illum && rawMtl.illum > 2) {
      m.reflectivity = (m.specular[0] + m.specular[1] + m.specular[2]) / 3
    }

    return m
  }

  /**
   * Create a basic Material with a solid diffuse colour
   */
  static createSolidColour(r: number, g: number, b: number) {
    const m = new Material()
    m.diffuse = [r, g, b]

    return m
  }

  /**
   * Create a new Material with a texture map loaded from a URL
   */
  static createBasicTexture(url: string, filter = true, flipY = false) {
    const m = new Material()

    m.diffuseTex = TextureCache.instance.getCreate(url, filter, flipY)

    return m
  }

  /**
   * Add a specular texture map to existing material, probably created with createBasicTexture
   * @param url
   * @param filter
   */
  addSpecularTexture(url: string, filter = true, flipY = false) {
    this.specularTex = TextureCache.instance.getCreate(url, filter, flipY)
    this.specular = [1, 1, 1]
    this.shininess = 20
  }

  /**
   * Add a normal texture map to existing material, probably created with createBasicTexture
   * @param url
   * @param filter
   */
  addNormalTexture(url: string, filter = true, flipY = false) {
    this.normalTex = TextureCache.instance.getCreate(url, filter, flipY)
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
  get uniforms(): UniformSet {
    return {
      ambient: this.ambient,
      diffuse: this.diffuse,
      specular: this.specular,
      emissive: this.emissive,
      shininess: this.shininess,
      opacity: this.opacity,
      reflectivity: this.reflectivity,
      diffuseTex: this.diffuseTex ? this.diffuseTex : null,
      specularTex: this.specularTex ? this.specularTex : null,
      normalTex: this.normalTex ? this.normalTex : null,
      hasNormalTex: this.normalTex ? true : false,
    } as UniformSet
  }
}
