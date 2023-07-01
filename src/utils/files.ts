// ===== files.ts =============================================================
// File loading utilities
// Ben Coleman, 2023
// ============================================================================

/**
 * Fetch a file from the server
 *
 * @param {string} path - URL path to file
 * @returns {Promise<string>} File contents as a string
 */
export async function fetchFile(filePath: string) {
  const resp = await fetch(filePath)

  if (!resp.ok) {
    throw new Error(`File fetch failed: ${resp.statusText}`)
  }

  const text = await resp.text()
  return text
}
