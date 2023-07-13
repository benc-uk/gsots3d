// ===== material.ts ==========================================================
// Represents a material, with all the properties from the MTL file
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, createTexture, setUniforms } from 'twgl.js'
import { RGB, UniformSet } from '../core/types.ts'
import { MtlMaterial } from '../parsers/mtl-parser.ts'
import { getGl } from '../core/gl.ts'

export class Material {
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
   * Shininess, for size of specular highlights
   * @default 0
   */
  public shininess: number

  /**
   * Ambient colour will be multiplied with the ambient light level & colour
   */
  public ambient: RGB

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

    m.diffuse = rawMtl.kd ? rawMtl.kd : [1, 1, 1]
    m.specular = rawMtl.ks ? rawMtl.ks : [0, 0, 0]
    m.shininess = rawMtl.ns ? rawMtl.ns : 0
    m.ambient = rawMtl.ka ? rawMtl.ka : [1, 1, 1]

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
      shininess: this.shininess,
      diffuseTex: this.diffuseTex ? this.diffuseTex : null,
      specularTex: this.specularTex ? this.specularTex : null,
    } as UniformSet
  }
}
