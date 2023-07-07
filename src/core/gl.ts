// ===== gl.ts ==========================================================
// Interactions with the GL context, as a global singleton
// Ben Coleman, 2023
// ======================================================================

import log from 'loglevel'

// Memoized global WebGL2 context
let glContext: WebGL2RenderingContext | undefined = undefined

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

  log.info('🖌️ Creating WebGL2 context')

  const canvas = document.querySelector(selector) as HTMLCanvasElement
  glContext = canvas.getContext('webgl2', { antialias: aa }) ?? undefined

  if (!glContext) {
    log.error('💥 Unable to create WebGL2 context!')
  }

  return glContext
}
