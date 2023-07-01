import { fetchFile, getGl } from './utils.mjs'
import { parseOBJ } from './obj-parser.mjs'
import { parseMTL } from './mtl-parser.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'

const OBJ_PATH = './objects/'

/** @type {Map<string, Model>} */
const cache = new Map()

/**
 * Holds a 3D model, as a list of parts, each with a material
 * Plus a set of materials, each with a set of properties
 */
export class Model {
  /** @type {string} */
  name = ''
  /** @type {Part[]} */
  parts = []
  /** @type {Object<string, Material>} */
  materials = {}

  /**
   * @param {string} name - The name of the model without extension
   */
  constructor(name) {
    console.log(`🗿 Loading model ${name}`)
    this.name = name
  }

  /**
   * @returns {Promise<void>}
   * @description Parses the OBJ file and loads the material library
   */
  async parse() {
    const objFile = await fetchFile(`${OBJ_PATH}${this.name}.obj`)
    const objData = parseOBJ(objFile)

    // We assume that the OBJ file has a SINGLE material library
    // This is a good assumption for nearly all files I've seen
    if (objData.matLibNames && objData.matLibNames.length > 0) {
      try {
        const mtlFile = await fetchFile(`${OBJ_PATH}${objData.matLibNames[0]}`)
        const materialsRawList = parseMTL(mtlFile)
        for (const [matName, matRaw] of Object.entries(materialsRawList)) {
          this.materials[matName] = new Material(matRaw)
        }
      } catch (err) {
        console.warn(`Unable to load material library ${objData.matLibNames[0]}`)
      }
    }

    // Fall back default material, some blueish color
    this.materials['__default'] = new Material({
      diffuse: [0.2, 0.5, 0.97],
    })

    const gl = getGl()
    for (const g of objData.geometries) {
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, g.data)
      this.parts.push(new Part(bufferInfo, g.material))
    }
  }
}

/**
 * Holds part of a model, as the WebGL buffers needed to render it
 * Plus the material name associated with this part
 */
class Part {
  /** @type {any} */
  bufferInfo

  /** @type {string} */
  materialName

  /**
   * @param {twgl.BufferInfo} bufferInfo - WebGL buffer info for this model part
   * @param {string} materialName - Name of the material associated with this part
   */
  constructor(bufferInfo, materialName) {
    this.bufferInfo = bufferInfo
    this.materialName = materialName
  }
}

/**
 * Encapsulates a material, as a set of properties
 */
export class Material {
  #UNIFORM_PREFIX = 'u_mat'

  /** @type {number[]} */
  diffuse
  /** @type {number[]} */
  specular
  /** @type {number} */
  shininess
  /** @type {number[]} */
  ambient
  /** @type {number[]} */
  emissive

  /** @param {object} matRaw - Raw object returned from parseMTL */
  constructor(matRaw) {
    this.diffuse = matRaw.kd
    this.specular = matRaw.ks
    this.shininess = matRaw.ns
    this.ambient = matRaw.ka
    this.emissive = matRaw.ke
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   *
   * @param {twgl.ProgramInfo|any} programInfo - WebGL program to apply the material to
   */
  apply(programInfo) {
    const uniforms = {}

    for (const [propName, propValue] of Object.entries(this)) {
      if (propValue) {
        uniforms[`${this.#UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = propValue
      }
    }

    twgl.setUniforms(programInfo, uniforms)
  }
}

/**
 * An instance of a model, with a position etc
 */
export class Instance {
  /** @type {number[]} */
  position = [0, 0, 0]

  /** @type {Model} */
  model

  /** @type {number[]} */
  scale = [1, 1, 1]

  /** @type {number[]} */
  rotate = [0, 0, 0]

  /** @type {boolean} */
  transparent = false

  /**
   * @param {Model|undefined} model - Model to use for this instance
   * @param {number[]} position - Position of the instance
   */
  constructor(model, position) {
    if (!model) {
      throw new Error('Model is required')
    }

    this.position = position
    this.model = model
  }

  rotateY(angle) {
    this.rotate[1] += angle
  }

  rotateX(angle) {
    this.rotate[0] += angle
  }

  rotateZ(angle) {
    this.rotate[2] += angle
  }
}

/**
 * Helper function get a model from the cache
 *
 * @param {string} name - Name of the model
 * @returns {Model|undefined} - Model if found, undefined otherwise
 */
export function getModel(name) {
  console.log(cache)
  if (!cache.has(name)) {
    throw new Error(`Model ${name} not loaded in cache`)
  }

  return cache.get(name)
}

/**
 * Helper function to add a model to the cache
 *
 * @param {string} name - Name of the model
 */
export function loadModel(name) {
  const model = new Model(name)
  model.parse()

  cache.set(name, model)
}
