// ===== obj-parser.mjs ==========================================================
// A simple OBJ parser, works well, but FAR from comprehensive
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-obj-loader.html
// Ben Coleman, 2023
// ===============================================================================

const keywordRE = /(\w*)(?: )*(.*)/

/**
 * @typedef {object} ObjData
 * @property {string[]} matLibNames - List of material library names
 * @property {Geometry[]} geometries - List of geometries
 */

/**
 * @typedef {object} Geometry
 * @property {string} material - Material name
 * @property {any[]} data - Parsed geometry data
 * @property {number[]} data.positions - List of vertex positions
 * @property {number[]} data.texcoords - List of vertex texture coordinates
 * @property {number[]} data.normals - List of vertex normals
 */

/**
 * Parse an OBJ file returning a list of geometries and materials libs
 *
 * @param {string} objFileString - OBJ file contents
 * @returns {ObjData} - Parsed OBJ data
 */
export function parseOBJ(objFileString) {
  const lines = objFileString.split('\n')

  const objPositions = [[0, 0, 0]]
  const objTexcoords = [[0, 0]]
  const objNormals = [[0, 0, 0]]

  // same order as `f` indices
  const objVertexData = [objPositions, objTexcoords, objNormals]

  // same order as `f` indices
  /** @type {any[][]} */
  let webglVertexData = [
    [], // positions
    [], // texcoords
    [], // normals
  ]

  const geometries = []
  let geometry = null
  let material = '__default'
  const materialLibs = []

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

    usemtl(_, unparsedArgs) {
      material = unparsedArgs
      newGeometry()
    },

    mtllib(_, unparsedArgs) {
      materialLibs.push(unparsedArgs)
    },

    // Not used, but suppress warnings
    s(_, _blah) {},
    o(_, _blah) {},
  }

  /**
   * Updates webglVertexData per vertex
   *
   * @param {string} vert - String in the form of "v/vt/vn" as per OBJ spec
   */
  function addVertex(vert) {
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
    if (geometry && geometry.data.position.length) {
      geometry = undefined
    }
  }

  /**
   *
   */
  function setGeometry() {
    if (!geometry) {
      const position = []
      const texcoord = []
      const normal = []

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
    if (g.data.texcoord.length <= 0) {
      delete g.data.texcoord
    }
  }

  // Return pair of array of geometry & array of material library names
  return {
    matLibNames: materialLibs,
    geometries: geometries,
  }
}
