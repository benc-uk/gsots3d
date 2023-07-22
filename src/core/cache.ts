// ===== cache.ts =============================================================
// Caches and managers for models and textures
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { Model } from '../models/model.ts'
import { createTexture } from 'twgl.js'
import { getGl } from './gl.ts'

/**
 * A simple cache for parsed and loaded models, indexed by name
 */
export class ModelCache {
  private cache = new Map<string, Model>()

  /**
   * Return a model from the cache by name
   * @param name
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
 * It is a global singleton, so only one instance can exist
 */
class TextureCache {
  private cache: Map<string, WebGLTexture>

  constructor() {
    this.cache = new Map<string, WebGLTexture>()

    const gl = getGl()
    if (!gl) return

    // Add default textures

    // 1 pixel white texture used as base for materials
    const white1pixel = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255],
    })

    // 2x2 checkerboard texture to be used as error texture
    const checkerboard = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255, 128, 128, 128, 255, 128, 128, 128, 255, 255, 255, 255, 255],
      width: 2,
      height: 2,
    })

    this.add('_defaults/white', white1pixel)
    this.add('_defaults/check', checkerboard)
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

    log.info(`🧰 Adding texture '${key}' to cache`)

    this.cache.set(key, texture)
  }

  /**
   * Create or return a texture from the cache by name
   * @param src URL or filename path of texture image
   * @param filter Enable texture filtering and mipmaps (default true)
   * @param flipY Flip the texture vertically (default true)
   */
  getCreate(src: string, filter = true, flipY = true) {
    const gl = getGl()
    if (!gl) return

    // check if texture already exists, if so return it
    if (this.cache.has(src)) {
      log.trace(`👍 Returning texture '${src}' from cache, nice!`)
      return this.get(src)
    }

    // Create texture and add to cache
    // NOTE. Catching errors here is very hard, as twgl.createTexture() doesn't throw errors
    const texture = createTexture(
      gl,
      {
        min: filter ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST,
        mag: filter ? gl.LINEAR : gl.NEAREST,
        src: src,
        flipY: flipY ? 1 : 0,
      },
      (err) => {
        if (err) {
          // There's not much we can do here, but log the error
          log.error('💥 Error loading texture', err)
        }
      }
    )

    this.add(src, texture)
    return texture
  }
}

export const textureCache = new TextureCache()
