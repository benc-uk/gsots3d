// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import * as twgl from 'twgl.js'
import { RGB } from './tuples.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { UniformSet, TextureOptions, getGl } from '../core/gl.ts'
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
   * Transparency threshold, pixels with alpha below this value will be discarded
   * @default 0.0
   */
  public alphaCutoff: number

  public additiveBlend = false

  /**
   * Create a new default material with diffuse white colour, all all default properties
   */
  constructor() {
    this.ambient = [1, 1, 1]
    this.diffuse = [1, 1, 1]
    this.specular = [0, 0, 0]
    this.emissive = [0, 0, 0]

    this.shininess = 20
    this.opacity = 1.0
    this.reflectivity = 0.0

    this.alphaCutoff = 0.0

    // 1 pixel white texture is used for solid colour & flat materials
    // A trick to avoid having multiple shaders for textured & non-textured materials
    this.diffuseTex = TextureCache.defaultWhite
    this.specularTex = TextureCache.defaultWhite
  }

  /**
   * Create a new material from a raw MTL material. Users are not expected to call this directly as it is used internally by the OBJ parser
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
   * Create a basic Material with a solid/flat diffuse colour
   * @param r Red component, 0.0 to 1.0
   * @param g Green component, 0.0 to 1.0
   * @param b Blue component, 0.0 to 1.0
   */
  static createSolidColour(r: number, g: number, b: number) {
    const m = new Material()
    m.diffuse = [r, g, b]

    return m
  }

  /**
   * Create a new Material with a texture map loaded from a URL/filepath or Buffer
   * @param src URL or filename path of texture image, or ArrayBufferView holding texture
   * @param filter Enable texture filtering and mipmaps (default true)
   * @param flipY Flip the texture vertically (default false)
   * @param extraOptions Extra options to pass to twgl.createTexture, see https://twgljs.org/docs/module-twgl.html#.TextureOptions
   */
  static createBasicTexture(
    src: string | ArrayBufferView,
    filter = true,
    flipY = false,
    extraOptions: TextureOptions = {},
  ) {
    const m = new Material()

    if (typeof src === 'string') {
      m.diffuseTex = TextureCache.instance.getCreate(src, filter, flipY, '', extraOptions)
    } else {
      // Invent a unique key for this texture
      const key = `arraybuffer_${TextureCache.size}`
      m.diffuseTex = TextureCache.instance.getCreate(src, filter, flipY, key, extraOptions)
    }

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

  /** Create a simple diffuse red Material */
  static get RED() {
    return Material.createSolidColour(1.0, 0.0, 0.0)
  }

  /** Create a simple diffuse green Material */
  static get GREEN() {
    return Material.createSolidColour(0.0, 1.0, 0.0)
  }

  /** Create a simple diffuse blue Material */
  static get BLUE() {
    return Material.createSolidColour(0.0, 0.0, 1.0)
  }

  /** Create a simple diffuse white Material */
  static get WHITE() {
    return Material.createSolidColour(1.0, 1.0, 1.0)
  }

  /** Create a simple diffuse black Material */
  static get BLACK() {
    return Material.createSolidColour(0.0, 0.0, 0.0)
  }

  /** Create a simple diffuse yellow Material */
  static get YELLOW() {
    return Material.createSolidColour(1.0, 1.0, 0.0)
  }

  /** Create a simple diffuse magenta Material */
  static get MAGENTA() {
    return Material.createSolidColour(1.0, 0.0, 1.0)
  }

  /** Create a simple diffuse cyan Material */
  static get CYAN() {
    return Material.createSolidColour(0.0, 1.0, 1.0)
  }

  /**
   * Adds this material to a program, as a set of uniforms
   * @param programInfo ProgramInfo object to update with uniforms
   * @param uniformSuffix Optional suffix to add to uniform names
   */
  apply(programInfo: twgl.ProgramInfo, uniformSuffix = '') {
    const uni = {
      [`u_mat${uniformSuffix}`]: this.uniforms,
    }

    twgl.setUniforms(programInfo, uni)

    const gl = getGl()

    if (gl) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      if (this.additiveBlend) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      }
    }
  }

  /**
   * Return the base set of uniforms for this material
   * @returns UniformSet object with all material properties
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
      alphaCutoff: this.alphaCutoff,
    } as UniformSet
  }

  /**
   * Clone this material, returns a new material with the same properties
   */
  clone() {
    const m = new Material()
    m.ambient = this.ambient
    m.diffuse = this.diffuse
    m.specular = this.specular
    m.emissive = this.emissive
    m.shininess = this.shininess
    m.opacity = this.opacity
    m.reflectivity = this.reflectivity
    m.diffuseTex = this.diffuseTex
    m.specularTex = this.specularTex
    m.normalTex = this.normalTex
    m.alphaCutoff = this.alphaCutoff
    m.additiveBlend = this.additiveBlend

    return m
  }
}
