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
   * Create a basic Material with a solid diffuse colour
   */
  public static createDiffuse(r: number, g: number, b: number) {
    const m = new Material()
    m.diffuse = [r, g, b]

    return m
  }

  /**
   * Create a new Material with a texture map loaded from a URL
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

  /** Create a simple RED Material */
  static get RED() {
    const m = Material.createDiffuse(1.0, 0.0, 0.0)
    return m
  }

  /** Create a simple GREEN Material */
  static get GREEN() {
    return Material.createDiffuse(0.0, 1.0, 0.0)
  }

  /** Create a simple BLUE Material */
  static get BLUE() {
    const m = Material.createDiffuse(0.0, 0.0, 1.0)

    return m
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   */
  public apply(programInfo: ProgramInfo) {
    setUniforms(programInfo, this.Uniforms)
  }

  /**
   * Return a map of uniforms for this material, with a prefix
   */
  public get Uniforms(): UniformSet {
    return {
      [`${UNIFORM_PREFIX}Texture`]: this.texture ? this.texture : null,
      [`${UNIFORM_PREFIX}Shininess`]: this.shininess ? this.shininess : 0,
      [`${UNIFORM_PREFIX}Diffuse`]: this.diffuse ? [...this.diffuse, 1] : [1, 1, 1, 1],
      [`${UNIFORM_PREFIX}Specular`]: this.specular ? [...this.specular, 1] : [0, 0, 0, 1],
      [`${UNIFORM_PREFIX}Ambient`]: this.ambient ? [...this.ambient, 1] : [1, 1, 1, 1],
    } as UniformSet
  }
}
