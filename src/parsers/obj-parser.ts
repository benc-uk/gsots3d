// ===== obj-parser.mjs ==========================================================
// A simple OBJ parser, works well, but FAR from comprehensive
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-obj-loader.html
// Ben Coleman, 2023
// ===============================================================================

import { Geometry } from '../core/geometry.ts'

const keywordRE = /(\w*)(?: )*(.*)/

export type ParseResult = {
  matLibNames: string[]
  geometries: Geometry[]
}

/**
 * Parse an OBJ file returning a list of geometries and materials libs
 *
 * @param {string} objFile - The OBJ file as a string
 * @returns {ParseResult} An object containing the geometries and material libs
 */
export function parseOBJ(objFile: string): ParseResult {
  const lines = objFile.split('\n')

  const objPositions = [[0, 0, 0]]
  const objTexcoords = [[0, 0]]
  const objNormals = [[0, 0, 0]]

  // same order as `f` indices
  const objVertexData = [objPositions, objTexcoords, objNormals]

  // same order as `f` indices
  let webglVertexData = [
    [], // position
    [], // texcoord
    [], // normal
  ] as number[][]

  const geometries = Array<Geometry>()
  let geometry = {} as Geometry
  let material = '__default'
  const materialLibs = Array<string>()

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat))
    },

    vn(parts) {
      objNormals.push(parts.map(parseFloat))
    },

    vt(parts) {
      objTexcoords.push(parts.map(parseFloat))
    },

    f(parts) {
      setGeometry()
      const numTriangles = parts.length - 2
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0])
        addVertex(parts[tri + 1])
        addVertex(parts[tri + 2])
      }
    },

    usemtl(_, unparsedArgs: string) {
      material = unparsedArgs
      newGeometry()
    },

    mtllib(_, unparsedArgs: string) {
      materialLibs.push(unparsedArgs)
    },

    // Not used, but suppress warnings
    s() {
      return
    },

    o() {
      return
    },
  }

  /**
   * Updates webglVertexData per vertex
   *
   * @param {string} vert - String in the form of "v/vt/vn" as per OBJ spec
   */
  function addVertex(vert: string) {
    const ptn = vert.split('/')

    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return
      }

      const objIndex = parseInt(objIndexStr)
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length)

      webglVertexData[i].push(...objVertexData[i][index])
    })
  }

  /**
   *
   */
  function newGeometry() {
    // If there is an existing geometry and it's not empty then start a new one.
    if (geometry.material) {
      geometry = {} as Geometry
    }
  }

  /**
   *
   */
  function setGeometry() {
    if (!geometry.material) {
      const position = [] as number[]
      const texcoord = [] as number[]
      const normal = [] as number[]

      webglVertexData = [position, texcoord, normal]

      /** @type {Geometry} */
      geometry = {
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      }

      geometries.push(geometry)
    }
  }

  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim()
    if (line === '' || line.startsWith('#')) {
      continue
    }

    const m = keywordRE.exec(line)
    if (!m) {
      continue
    }

    const [, keyword, unparsedArgs] = m
    const parts = line.split(/\s+/).slice(1)

    const handler = keywords[keyword]
    if (!handler) {
      console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1)
      continue
    }

    handler(parts, unparsedArgs)
  }

  // FIX: For those OBJ files that don't have texcoord data
  for (const g of geometries) {
    if (g.data.texcoord && g.data.texcoord.length <= 0) {
      delete g.data.texcoord
    }
  }

  // Return pair of array of geometry & array of material library names
  return {
    matLibNames: materialLibs,
    geometries: geometries,
  } as ParseResult
}
