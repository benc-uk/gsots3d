// ===== utils.mjs ===============================================================
// A collection of helper functions
// Ben Coleman, 2023
// ===============================================================================

/** @type {WebGL2RenderingContext} */
let glContext

/**
 * Get the WebGL2 context, if it doesn't exist create it
 *
 * @returns {WebGL2RenderingContext} - Global WebGL2 context
 * @param {boolean} aa - Enable antialiasing
 * @param {string} selector - CSS selector for locating the canvas element
 */
export function getGl(aa = true, selector = 'canvas') {
  if (glContext) {
    return glContext
  }

  console.log('🖌️ Creating WebGL2 context')

  const canvas = document.querySelector(selector)
  // @ts-ignore
  glContext = canvas.getContext('webgl2', { antialias: aa })

  if (!glContext) {
    console.log('💥 Unable to create WebGL2 context!')
  }

  return glContext
}

/**
 * Fetch a pair of shaders from the server
 *
 * @param {string} vertPath - URL path to vertex shader
 * @param {string} fragPath - URL path to fragment shader
 * @returns {Promise<{vertex: string, fragment: string}>} - Shaders as strings
 */
export async function fetchShaders(vertPath, fragPath) {
  const vsResp = await fetch(vertPath)
  const fsResp = await fetch(fragPath)

  if (!vsResp.ok || !fsResp.ok) {
    throw new Error(`Fetch failed - vertex: ${vsResp.statusText}, fragment: ${fsResp.statusText}`)
  }

  const vsText = await vsResp.text()
  const fsText = await fsResp.text()

  return { vertex: vsText, fragment: fsText }
}

/**
 * Fetch a file from the server
 *
 * @param {string} path - URL path to file
 * @returns {Promise<string>} - File contents as a string
 */
export async function fetchFile(path) {
  const resp = await fetch(path)

  if (!resp.ok) {
    throw new Error(`File fetch failed: ${resp.statusText}`)
  }

  const text = await resp.text()
  return text
}

/**
 * Set the overlay text, used for showing messages
 *
 * @param {string} message - Text to display
 */
export function setOverlay(message) {
  const overlay = document.getElementById('overlay')
  if (!overlay) return
  overlay.style.display = 'block'
  overlay.innerHTML = message
}

/**
 * Hide the overlay
 */
export function hideOverlay() {
  const overlay = document.getElementById('overlay')
  if (!overlay) return
  overlay.style.display = 'none'
}
