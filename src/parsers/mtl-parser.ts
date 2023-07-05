// ===== mtl-parser.mjs ==========================================================
// A simple MTL parser
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
// Ben Coleman, 2023
// ===============================================================================

export type MtlMaterial = {
  ns?: number
  ka?: [number, number, number]
  kd?: [number, number, number]
  ks?: [number, number, number]
  ke?: [number, number, number]
  ni?: number
  d?: number
  illum?: number
}

/**
 * Parse an MTL file returning a map of materials
 * Results should be passed to new Material() to create a material
 *
 * @param {string} mtlFile - The MTL file as a string
 * @returns {Map<string, MtlMaterial>} - A map of materials
 */
export function parseMTL(mtlFile: string): Map<string, MtlMaterial> {
  const materials = new Map<string, MtlMaterial>()
  let material = {} as MtlMaterial

  const keywords = {
    newmtl(_, unparsedArgs: string) {
      material = {} as MtlMaterial
      materials.set(unparsedArgs, material)
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
  const lines = mtlFile.split('\n')

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
