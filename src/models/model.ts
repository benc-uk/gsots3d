// ===== models/model.ts ======================================================
// Main model class, holds a list of parts, each with a material
// Models are parsed from OBJ files
// Ben Coleman, 2023
// ============================================================================

import { BufferInfo, createBufferInfoFromArrays } from 'twgl.js'
import { Material } from '../render/material.ts'
import { parseMTL } from '../parsers/mtl-parser.ts'
import { parseOBJ } from '../parsers/obj-parser.ts'
import { fetchFile } from '../utils/files.ts'
import { getGl } from '../core/gl.ts'
import log from 'loglevel'

/**
 * Holds a 3D model, as a list of parts, each with a material
 * Plus map of named materials
 */
export class Model {
  public readonly name: string
  public readonly parts = [] as ModelPart[]
  public readonly materials = {} as Record<string, Material>

  /**
   * Constructor is private, use static `parse()` method instead
   */
  private constructor(name: string) {
    this.name = name
  }

  /**
   * Parse an OBJ file & MTL material libraries, returns a new Model
   *
   * @param {string} path - The path to the OBJ file
   * @param {string} objFilename - The name of the OBJ file
   * @returns {Promise<Model>}
   */
  static async parse(path = '.', objFilename: string) {
    // Create a new model with the name of the file
    const name = objFilename.split('.')[0]
    const model = new Model(name)

    // Load the OBJ file from URL
    let objFile: string
    try {
      objFile = await fetchFile(`${path}/${objFilename}`)
    } catch (err) {
      throw new Error(`💥 Unable to load model ${objFilename}`)
    }

    // Try to parse the OBJ file
    const objData = parseOBJ(objFile)
    if (!objData.geometries || objData.geometries.length === 0) {
      throw new Error(`💥 Error parsing model ${objFilename}`)
    }

    // We assume that the OBJ file has a SINGLE material library
    // This is a good assumption for nearly all files I've seen
    if (objData.matLibNames && objData.matLibNames.length > 0) {
      try {
        const mtlFile = await fetchFile(`${path}/${objData.matLibNames[0]}`)
        const materialsRawList = parseMTL(mtlFile)

        for (const [matName, matRaw] of materialsRawList) {
          model.materials[matName] = new Material(matRaw)
        }
      } catch (err) {
        console.warn(`Unable to load material library ${objData.matLibNames[0]}`)
      }
    }

    // Fall back default material, some blueish color
    const defMat = new Material({
      kd: [0.2, 0.5, 0.97],
    })
    model.materials['__default'] = defMat

    const gl = getGl()

    if (!gl) {
      throw new Error('Unable to get WebGL context')
    }

    for (const g of objData.geometries) {
      const bufferInfo = createBufferInfoFromArrays(gl, g.data)
      model.parts.push(new ModelPart(bufferInfo, g.material))
    }

    log.debug(
      `♟️ Model '${objFilename}' loaded with ${model.parts.length} parts, ${
        Object.keys(model.materials).length
      } materials`
    )

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
