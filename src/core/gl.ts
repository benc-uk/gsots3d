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

  log.info(`🖌️ Creating new WebGL2 context for: '${selector}'`)

  const canvasElement = document.querySelector(selector) as HTMLElement
  if (!canvasElement) {
    log.error(`💥 FATAL! Unable to find element with selector: '${selector}'`)
    return undefined
  }

  if (canvasElement && canvasElement.tagName !== 'CANVAS') {
    log.error(`💥 FATAL! Element with selector: '${selector}' is not a canvas element`)
    return undefined
  }

  const canvas = canvasElement as HTMLCanvasElement
  if (!canvas) {
    log.error(`💥 FATAL! Unable to find canvas element with selector: '${selector}'`)
    return undefined
  }

  glContext = canvas.getContext('webgl2', { antialias: aa }) ?? undefined

  if (!glContext) {
    log.error(`💥 Unable to create WebGL2 context, maybe it's not supported on this device`)
    return undefined
  }

  log.info(`📐 Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`)

  const varyings = glContext.getParameter(glContext.MAX_VARYING_VECTORS)
  const varyingsTF = glContext.getParameter(glContext.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS)
  const varyingsTFI = glContext.getParameter(glContext.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS)
  const uniforms = glContext.getParameter(glContext.MAX_VERTEX_UNIFORM_VECTORS)
  const texSize = glContext.getParameter(glContext.MAX_TEXTURE_SIZE)
  console.log(
    `🚦 WebGL2 limits: Varyings=${varyings}, TF var=${varyingsTF} / ${varyingsTFI} Uniforms=${uniforms}, Texture size=${texSize}`
  )

  return glContext
}
