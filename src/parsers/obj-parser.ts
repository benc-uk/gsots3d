// ===== obj-parser.mjs ==========================================================
// A simple OBJ parser, works well, but FAR from comprehensive
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-obj-loader.html
// Ben Coleman, 2023
// ===============================================================================

const keywordRE = /(\w*)(?: )*(.*)/

/**
 * ParseResult is the result of parsing an OBJ file
 */
export type ParseResult = {
  /** List of material libs (MTL files) */
  matLibNames: string[]

  /** List of geometries, each with a material name and vertex data */
  geometries: Geometry[]

  /** Total number of triangles in the OBJ file */
  triangles: number
}

/**
 * Each OBJ file is made up of a list of geometries, each with a material name.
 * These can be thought of as parts of the overall model.
 */
export type Geometry = {
  /** Name of the material for this geometry part */
  material: string

  /** Vertex data for this geometry part, ready for turning into an BufferInfo in twgl.js */
  data: {
    position: number[]
    texcoord?: number[]
    normal: number[]
    tangent?: number[]
  }
}

/**
 * Parse an OBJ file returning a list of geometries and materials libs
 * @param {string} objFile - The OBJ file as a string
 * @param {boolean} flipUV - Flip the V texcoord axis, for OpenGL
 */
export function parseOBJ(objFile: string, flipUV: boolean) {
  const lines = objFile.split('\n')

  const objPositions = [[0, 0, 0]]
  const objTexcoords = [[0, 0]]
  const objNormals = [[0, 0, 0]]

  // Same order as `f` indices
  const objVertexData = [objPositions, objTexcoords, objNormals]

  let triangles = 0

  // Same order as `f` indices
  let webglVertexData = [
    [], // Position
    [], // Texcoord
    [], // Normal
  ] as number[][]

  const geometries = Array<Geometry>()
  let geometry = {} as Geometry
  let material = '__default'
  const materialLibs = Array<string>()

  const keywords = {
    v(parts: string[]) {
      objPositions.push(parts.map(parseFloat))
    },

    vn(parts: string[]) {
      objNormals.push(parts.map(parseFloat))
    },

    vt(parts: string[]) {
      // Only 2D texcoords supported, so ignore the 3rd if present
      // Also handle UV flip in the V direction (Y axis) for OpenGL
      if (flipUV) {
        objTexcoords.push([parseFloat(parts[0]), 1.0 - parseFloat(parts[1])])
      } else {
        objTexcoords.push([parseFloat(parts[0]), parseFloat(parts[1])])
      }
    },

    f(parts: string[]) {
      triangles++
      setGeometry()
      const numTriangles = parts.length - 2
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0])
        addVertex(parts[tri + 1])
        addVertex(parts[tri + 2])
      }
    },

    usemtl(_: string[], unparsedArgs: string) {
      material = unparsedArgs
      newGeometry()
    },

    mtllib(_: string[], unparsedArgs: string) {
      materialLibs.push(unparsedArgs)
    },

    // Not used, but suppress warnings
    s() {
      return
    },

    o() {
      return
    },

    g() {
      return
    },

    l() {
      return
    },
  } as Record<string, (parts: string[], unparsedArgs: string) => void>

  /**
   * Updates webglVertexData per vertex
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
   * Start a new geometry object
   */
  function newGeometry() {
    // If there is an existing geometry and it's not empty then start a new one.
    if (geometry.material) {
      geometry = {} as Geometry
    }
  }

  /**
   * Set the geometry for the current material/part
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

  // Parse the OBJ file line by line
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

  // Return the list of geometries and material libs, plus triangle count
  return {
    matLibNames: materialLibs,
    geometries,
    triangles,
  } as ParseResult
}
