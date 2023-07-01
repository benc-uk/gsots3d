import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'
import { getGl } from './utils.mjs'

const SIZE = 14

/** Sprite is a billboarded 2D sprite in 3D space */
export class Sprite {
  /** @type {string} */
  name = ''
  /** @type {any} */
  buffers
  /** @type {WebGLTexture} */
  texture
  /** @type {number[]} */
  position = [0, 0, 0]

  constructor(name) {
    const gl = getGl()
    const spriteTransform = mat4.create()
    mat4.rotateX(spriteTransform, spriteTransform, Math.PI / 2)
    this.buffers = twgl.primitives.createPlaneBufferInfo(gl, SIZE, SIZE, 2, 2, spriteTransform)

    this.texture = twgl.createTexture(gl, {
      src: `sprites/${name}.png`,
      mag: gl.NEAREST,
      min: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
    })

    this.name = name
    this.position = [0, 0, 0]
  }
}
