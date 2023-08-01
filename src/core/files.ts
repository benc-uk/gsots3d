// ===== files.ts =============================================================
// File loading utilities
// Ben Coleman, 2023
// ============================================================================

type Shader = {
  vertex: string
  fragment: string
}

/**
 * Fetch a file from the server
 *
 * @param {string} path - URL path to file
 * @returns {Promise<string>} File contents as a string
 */
export async function fetchFile(filePath: string) {
  const resp = await fetch(filePath)

  if (!resp.ok) {
    throw new Error(`💥 File fetch failed: ${resp.statusText}`)
  }

  const text = await resp.text()
  return text
}

/**
 * Fetch a pair of shaders from the server
 *
 * @param {string} vertPath - URL path to vertex shader
 * @param {string} fragPath - URL path to fragment shader
 * @returns {Promise<Shader>} Pair of shaders as strings
 */
export async function fetchShaders(vertPath: string, fragPath: string) {
  const vsResp = await fetch(vertPath)
  const fsResp = await fetch(fragPath)

  if (!vsResp.ok || !fsResp.ok) {
    throw new Error(`💥 Fetch failed - vertex: ${vsResp.statusText}, fragment: ${fsResp.statusText}`)
  }

  const vsText = await vsResp.text()
  const fsText = await fsResp.text()

  return { vertex: vsText, fragment: fsText } as Shader
}
