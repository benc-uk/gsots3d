// ===== mtl-parser.mjs ==========================================================
// A simple MTL parser
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
// Ben Coleman, 2023
// ===============================================================================

/**
 * Parse an MTL file returning a map of materials
 * Results should be passed new Material() to create a material
 *
 * @param {string} mtlFileString - MTL file contents
 * @returns {Map<string, object>} - Parsed MTL data as a dictionary of materials
 */
export function parseMTL(mtlFileString) {
  const materials = new Map()
  let material

  const keywords = {
    newmtl(_, unparsedArgs) {
      material = {}
      materials[unparsedArgs] = material
    },

    Ns(parts) {
      material.ns = parseFloat(parts[0])
    },
    Ka(parts) {
      material.ka = parts.map(parseFloat)
    },
    Kd(parts) {
      material.kd = parts.map(parseFloat)
    },
    Ks(parts) {
      material.ks = parts.map(parseFloat)
    },
    Ke(parts) {
      material.ke = parts.map(parseFloat)
    },
    Ni(parts) {
      material.ni = parseFloat(parts[0])
    },
    d(parts) {
      material.d = parseFloat(parts[0])
    },
    illum(parts) {
      material.illum = parseInt(parts[0])
    },
  }

  const keywordRE = /(\w*)(?: )*(.*)/
  const lines = mtlFileString.split('\n')

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
      console.warn('unhandled keyword:', keyword)
      continue
    }

    handler(parts, unparsedArgs)
  }

  return materials
}
