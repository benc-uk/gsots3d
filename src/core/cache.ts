// ===== models/cache.ts ======================================================
// A simple cache for models, so we don't have to keep loading them
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { Model } from '../models/model.ts'

/**
 * A simple cache for models, indexed by name
 */
export class ModelCache {
  private cache = new Map<string, Model>()

  /**
   * Return a model from the cache by name
   * @param name
   */
  get(name: string) {
    if (!this.cache.has(name)) {
      throw new Error(`Model ${name} not found in cache`)
    }

    return this.cache.get(name)
  }

  /**
   * Add a model to the cache
   */
  add(model: Model) {
    log.debug(`🧰 Adding model '${model.name}' to cache`)

    this.cache.set(model.name, model)
  }
}