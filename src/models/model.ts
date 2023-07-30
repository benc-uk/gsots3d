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

/**
 * Holds a 3D model, as a list of parts, each with a material
 * Plus map of named materials
 */
export class Model implements Renderable {
  /** Name of the model, usually the filename without the extension */
  public readonly name: string

  /** Array of model sub-parts */
  private readonly parts = [] as ModelPart[]

  /** Named map of materials for all parts */
  private readonly materials = {} as Record<string, Material>

  /** Total number of triangles in the model */
  private triangles: number

  /**
   * Constructor is private, use static `parse()` method instead
   */
  private constructor(name: string) {
    this.name = name
    this.triangles = 0
  }

  /**
   * Render is used draw this model, this is called from the Instance that wraps
   * this renderable.
   */
  render(
    gl: WebGL2RenderingContext,
    uniforms: UniformSet,
    programInfo: ProgramInfo,
    materialOverride?: Material
  ): void {
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

        material.apply(programInfo)
      } else {
        materialOverride.apply(programInfo)
      }

      setBuffersAndAttributes(gl, programInfo, bufferInfo)
      setUniforms(programInfo, uniforms)

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
   */
  static async parse(path = '.', objFilename: string, filterTextures = true, flipTextureY = true) {
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
    const objData = parseOBJ(objFile)
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
      throw new Error('Unable to get WebGL context')
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
