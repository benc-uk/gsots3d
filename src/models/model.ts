// ===== model.ts =============================================================
// Main model class, holds a list of parts, each with a material
// Models are parsed from OBJ files
// Ben Coleman, 2023
// ============================================================================

import {
  BufferInfo,
  ProgramInfo,
  createBufferInfoFromArrays,
  drawBufferInfo,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js'
import log from 'loglevel'

import { Material } from '../engine/material.ts'
import { parseMTL } from '../parsers/mtl-parser.ts'
import { parseOBJ } from '../parsers/obj-parser.ts'
import { fetchFile } from '../core/files.ts'
import { getGl, UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { stats } from '../core/stats.ts'
import { ProgramCache } from '../core/cache.ts'

/**
 * Holds a 3D model, as a list of parts, each with a material
 * Plus map of named materials
 */
export class Model implements Renderable {
  private programInfo: ProgramInfo
  private readonly parts = [] as ModelPart[]
  private readonly materials = {} as Record<string, Material>
  private triangles: number

  /** Name of the model, usually the filename without the extension */
  public readonly name: string

  /**
   * Constructor is private, use static `parse()` method instead
   */
  private constructor(name: string) {
    this.name = name
    this.triangles = 0
    this.programInfo = ProgramCache.instance.default
  }

  /**
   * Render is used draw this model, this is called from the Instance that wraps
   * this renderable.
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, materialOverride?: Material): void {
    gl.useProgram(this.programInfo.program)

    // Render each part of the model
    for (const part of this.parts) {
      const bufferInfo = part.bufferInfo

      if (materialOverride === undefined) {
        // Get the named material for this part
        let material = this.materials[part.materialName]

        // Fall back to default material if not found
        if (!material) {
          material = this.materials['__default']
        }

        material.apply(this.programInfo)
      } else {
        materialOverride.apply(this.programInfo)
      }

      setBuffersAndAttributes(gl, this.programInfo, bufferInfo)
      setUniforms(this.programInfo, uniforms)

      drawBufferInfo(gl, bufferInfo)
      stats.drawCallsPerFrame++
    }
  }

  /** Simple getter for the number of triangles in the model */
  get triangleCount(): number {
    return this.triangles
  }

  /**
   * Parse an OBJ file & MTL material libraries, returns a new Model
   * @param {string} path - The path to the OBJ file
   * @param {string} objFilename - The name of the OBJ file
   * @param {boolean} filterTextures - Apply texture filtering to textures, default: true
   * @param {boolean} flipTextureY - Flip the Y axis of textures as they are loaded, default: false
   * @param {boolean} flipUV - Flip the UV coords of the model in the vertex/mesh data, default: true
   */
  static async parse(path = '.', objFilename: string, filterTextures = true, flipTextureY = false, flipUV = true) {
    const startTime = performance.now()

    // Create a new model with the name of the file
    const name = objFilename.split('.')[0]
    const model = new Model(name)

    // Load the OBJ file from URL
    let objFile: string
    try {
      objFile = await fetchFile(`${path}/${objFilename}`)
    } catch (err) {
      throw new Error(`💥 Unable to load file '${path}/${objFilename}'`)
    }

    // Try to parse the OBJ file
    // NOTE: We flip texture coords by default, this is because most OBJ files don't work with OpenGL
    const objData = parseOBJ(objFile, flipUV)

    if (!objData.geometries || objData.geometries.length === 0) {
      throw new Error(`💥 Error parsing '${objFilename}', might not be a OBJ file`)
    }

    // We assume that the OBJ file has a SINGLE material library
    // This is a good assumption for nearly all files I've seen
    if (objData.matLibNames && objData.matLibNames.length > 0) {
      try {
        const mtlFile = await fetchFile(`${path}/${objData.matLibNames[0]}`)
        const materialsRawList = parseMTL(mtlFile)

        for (const [matName, matRaw] of materialsRawList) {
          model.materials[matName] = Material.fromMtl(matRaw, path, filterTextures, flipTextureY)
        }
      } catch (err) {
        log.warn(`💥 Unable to load material library ${objData.matLibNames[0]}`)
      }
    }

    // Fall back default material
    model.materials['__default'] = new Material()
    model.materials['__default'].diffuse = [0.1, 0.6, 0.9]

    // This really should already been memoized by the context at this point
    const gl = getGl()

    if (!gl) {
      throw new Error('💥 Unable to get WebGL context')
    }

    for (const g of objData.geometries) {
      // TODO: One day add tangent generation
      const bufferInfo = createBufferInfoFromArrays(gl, g.data)
      model.parts.push(new ModelPart(bufferInfo, g.material))
    }

    log.debug(
      `♟️ Model '${objFilename}' loaded with ${model.parts.length} parts, ${
        Object.keys(model.materials).length
      } materials in ${((performance.now() - startTime) / 1000).toFixed(2)}s`
    )

    model.triangles = objData.triangles
    return model
  }

  /**
   * Get list of all material names in this model used by all parts
   * @returns {string[]} - List of material names
   */
  get materialNames(): string[] {
    return Object.keys(this.materials)
  }

  /**
   * Get number of parts in this model
   */
  get partsCount(): number {
    return this.parts.length
  }

  /**
   * Get list of parts in this model, names are the material names
   * @returns {string[]} - List of part material names
   */
  get partList(): string[] {
    return this.parts.map((p) => p.materialName)
  }

  /**
   * Can modify & override an existing named material
   * @param {string} name - Name of the material to modify
   * @param {Material} material - New material to use
   */
  setNamedMaterial(name: string, material: Material): void {
    this.materials[name] = material
  }

  /**
   * Get a named material
   * @param {string} name - Name of the material to get
   */
  getNamedMaterial(name: string): Material {
    return this.materials[name]
  }
}

/**
 * Holds part of a model, as the WebGL buffers needed to render it
 * Plus the material name associated with this part
 */
class ModelPart {
  public readonly bufferInfo: BufferInfo
  public readonly materialName: string

  /**
   * @param {twgl.BufferInfo} bufferInfo - WebGL buffer info for this model part
   * @param {string} materialName - Name of the material associated with this part
   */
  constructor(bufferInfo: BufferInfo, materialName: string) {
    this.bufferInfo = bufferInfo
    this.materialName = materialName
  }
}
