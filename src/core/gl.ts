// ===== gl.ts ==========================================================
// Interactions with the GL context, as a global singleton
// Ben Coleman, 2023
// ======================================================================

import { mat4 } from 'gl-matrix'
import log from 'loglevel'

/** A map of uniforms that can be used when WebGL rendering, typically applied with twlg.setUniforms() */
export type UniformSet = { [key: string]: number | number[] | mat4 | WebGLTexture | null }

// Memoized global WebGL2 context
let glContext: WebGL2RenderingContext | undefined

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

  log.info(`🖌️ Creating WebGL2 context in element: '${selector}'`)

  const canvas = document.querySelector(selector) as HTMLCanvasElement
  glContext = canvas.getContext('webgl2', { antialias: aa }) ?? undefined

  if (!glContext) {
    log.error('💥 Unable to create WebGL2 context!')
  }

  log.info(`📐 Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`)

  return glContext
}
