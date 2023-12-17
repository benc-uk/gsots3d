// ===== cache.ts =============================================================
// Caches and managers for models and textures
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { Model } from '../renderable/model.ts'
import { ProgramInfo, createTexture } from 'twgl.js'

/** @ignore */
export const PROG_DEFAULT = 'phong'
/** @ignore */
export const PROG_BILLBOARD = 'billboard'

/**
 * A singleton cache for parsed and loaded models, indexed by name
 */
export class ModelCache {
  private cache: Map<string, Model>
  private static _instance: ModelCache

  private constructor() {
    this.cache = new Map<string, Model>()
  }

  /**
   * Return the singleton instance of the model cache
   */
  static get instance() {
    if (!ModelCache._instance) {
      ModelCache._instance = new ModelCache()
    }

    return ModelCache._instance
  }

  /**
   * Return a model from the cache by name
   * @param name Name of model without extension
   * @param warn If true, log a warning if model not found
   */
  get(name: string, warn = true) {
    if (!this.cache.has(name) && warn) {
      log.warn(`⚠️ Model '${name}' not found, please load it first`)
      return undefined
    }

    return this.cache.get(name)
  }

  /**
   * Add a model to the cache, using the model name as key
   */
  add(model: Model) {
    log.debug(`🧰 Adding model '${model.name}' to cache`)

    this.cache.set(model.name, model)
  }
}

/**
 * A caching texture manager
 * It is instantiated with a WebGL context and then used to load and cache textures
 */
export class TextureCache {
  private cache: Map<string, WebGLTexture>
  private gl: WebGL2RenderingContext
  private static _instance: TextureCache
  private static initialized = false
  private defaultWhite: WebGLTexture
  private defaultRand: WebGLTexture

  private constructor() {
    this.cache = new Map<string, WebGLTexture>()
    this.gl = {} as WebGL2RenderingContext
    this.defaultWhite = {} as WebGLTexture
    this.defaultRand = {} as WebGLTexture
  }

  // Create a new texture cache
  static init(gl: WebGL2RenderingContext, randSize = 512) {
    this._instance = new TextureCache()
    this._instance.gl = gl

    // 1 pixel white texture used as base for materials
    const white1pixel = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255],
    })

    // Random RGB texture, used for pseudo random number generation
    const randArray = new Uint8Array(randSize * randSize * 4)
    for (let i = 0; i < randSize * randSize * 4; i++) {
      randArray[i] = Math.floor(Math.random() * 255)
    }
    const randomRGB = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: randArray,
      width: randSize,
      height: randSize,
      wrap: gl.REPEAT,
    })

    this._instance.defaultWhite = white1pixel
    this._instance.defaultRand = randomRGB

    TextureCache.initialized = true
  }

  /**
   * Return the singleton instance of the texture cache
   */
  static get instance() {
    if (!TextureCache.initialized) {
      throw new Error('TextureCache not initialized, call TextureCache.init() first')
    }

    return this._instance
  }

  /**
   * Return a texture from the cache by name
   * @param key Key of texture, this is usually the URL or filename path
   */
  get(key: string) {
    if (!this.cache.has(key)) {
      log.warn(`💥 Texture ${key} not found in cache`)
      return undefined
    }

    log.trace(`👍 Returning texture '${key}' from cache, nice!`)
    return this.cache.get(key)
  }

  /**
   * Add a texture to the cache
   * @param key Key of texture, this is usually the URL or filename path
   * @param texture WebGL texture
   */
  add(key: string, texture: WebGLTexture) {
    if (this.cache.has(key)) {
      log.warn(`🤔 Texture '${key}' already in cache, not adding again`)
      return
    }

    log.debug(`🧰 Adding texture '${key}' to cache`)

    this.cache.set(key, texture)
  }

  /**
   * Create or return a texture from the cache by name
   * @param src URL or filename path of texture image
   * @param filter Enable texture filtering and mipmaps (default true)
   * @param flipY Flip the texture vertically (default true)
   */
  getCreate(src: string, filter = true, flipY = false) {
    // Check if texture already exists, if so return it
    if (this.cache.has(src)) {
      log.trace(`👍 Returning texture '${src}' from cache, nice!`, flipY)
      return this.get(src)
    }

    // Create texture and add to cache
    // NOTE. Catching errors here is very hard, as twgl.createTexture() doesn't throw errors
    const texture = createTexture(
      this.gl,
      {
        min: filter ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.NEAREST,
        mag: filter ? this.gl.LINEAR : this.gl.NEAREST,
        src,
        flipY: flipY ? 1 : 0,
      },
      (err) => {
        if (err) {
          // There's not much we can do here, but log the error
          log.error('💥 Error loading texture', err)
        }
      },
    )

    this.add(src, texture)
    return texture
  }

  /**
   * Return the default white 1x1 texture
   */
  static get defaultWhite() {
    return this.instance.defaultWhite
  }

  /**
   * Return the default random RGB texture
   */
  static get defaultRand() {
    return this.instance.defaultRand
  }
}

/**
 * Singleton cache for parsed and loaded GL programs, indexed by name
 */
export class ProgramCache {
  private cache: Map<string, ProgramInfo>
  private _default: ProgramInfo
  private static _instance: ProgramCache
  private static initialized = false

  public static PROG_PHONG = 'phong'
  public static PROG_BILLBOARD = 'billboard'
  public static PROG_SHADOWMAP = 'shadowmap'

  /**
   * Create a new program cache, can't be used until init() is called
   */
  private constructor() {
    this.cache = new Map<string, ProgramInfo>()
    // This is pretty nasty, but we really trust people to call init() first
    this._default = {} as ProgramInfo
  }

  /**
   * Initialise the program cache with a default program.
   * This MUST be called before using the cache
   * @param defaultProg The default program that can be used by most things
   */
  public static init(defaultProg: ProgramInfo) {
    if (ProgramCache._instance) {
      log.warn('🤔 Program cache already initialised, not doing it again')
      return
    }

    ProgramCache._instance = new ProgramCache()
    ProgramCache._instance._default = defaultProg
    ProgramCache.initialized = true
  }

  /**
   * Return the singleton instance of the program cache
   */
  static get instance() {
    if (!ProgramCache.initialized) {
      throw new Error('💥 Program cache not initialised, call init() first')
    }

    return ProgramCache._instance
  }

  /**
   * Return a program from the cache by name
   * @param name Name of program
   */
  get(name: string): ProgramInfo {
    const prog = this.cache.get(name)

    if (!prog) {
      log.warn(`⚠️ Program '${name}' not found, returning default`)
      return this._default
    }

    return prog
  }

  add(name: string, program: ProgramInfo) {
    log.debug(`🧰 Adding program '${name}' to cache`)

    this.cache.set(name, program)
  }

  get default() {
    return this._default
  }
}
