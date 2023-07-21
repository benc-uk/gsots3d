// ===== mtl-parser.mjs ==========================================================
// A simple MTL parser
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
// Ben Coleman, 2023
// ===============================================================================

/**
 * A "raw" material fetched from the MTL parser, don't use this directly
 */
export type MtlMaterial = {
  ns?: number
  ka?: [number, number, number]
  kd?: [number, number, number]
  ks?: [number, number, number]
  ke?: [number, number, number]
  ni?: number
  d?: number
  illum?: number
  texDiffuse?: string
  texSpecular?: string
}

/**
 * Parse an MTL file returning a map of materials.
 * The returned {@link typescript!MtlMaterial} should be passed to new Material() to create a material
 *
 * @param {string} mtlFile - The MTL file as a string
 * @returns {Map<string, MtlMaterial>} - A map of materials
 */
export function parseMTL(mtlFile: string): Map<string, MtlMaterial> {
  const materials = new Map<string, MtlMaterial>()
  let material = {} as MtlMaterial

  const keywords = {
    newmtl(_: string[], unparsedArgs: string) {
      material = {} as MtlMaterial
      materials.set(unparsedArgs, material)
    },

    Ns(parts: string[]) {
      material.ns = parseFloat(parts[0])
    },
    Ka(parts: string[]) {
      material.ka = <[number, number, number]>parts.map(parseFloat)
    },
    Kd(parts: string[]) {
      material.kd = <[number, number, number]>parts.map(parseFloat)
    },
    Ks(parts: string[]) {
      material.ks = <[number, number, number]>parts.map(parseFloat)
    },
    // This is a non-standard addition, but semi-official
    Ke(parts: string[]) {
      material.ke = <[number, number, number]>parts.map(parseFloat)
    },
    Ni(parts: string[]) {
      material.ni = parseFloat(parts[0])
    },
    d(parts: string[]) {
      material.d = parseFloat(parts[0])
    },
    illum(parts: string[]) {
      material.illum = parseInt(parts[0])
    },
    map_Kd(_: string[], unparsedArgs: string) {
      material.texDiffuse = unparsedArgs
    },
    map_Ks(_: string[], unparsedArgs: string) {
      material.texSpecular = unparsedArgs
    },
  } as Record<string, (parts: string[], unparsedArgs: string) => void>

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
      //console.warn('unhandled keyword:', keyword)
      continue
    }

    handler(parts, unparsedArgs)
  }

  return materials
}
