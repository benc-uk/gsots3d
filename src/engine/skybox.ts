// ===== skybox.ts ==========================================================
// Skybox or simple background
// Ben Coleman, 2023
// ============================================================================

import {
  BufferInfo,
  ProgramInfo,
  createProgramInfo,
  createTexture,
  drawBufferInfo,
  primitives,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js'
import { mat4 } from 'gl-matrix'
import log from 'loglevel'

import { Camera } from './camera.ts'

import fragShaderSkybox from '../../shaders/skybox/glsl.frag'
import vertShaderSkybox from '../../shaders/skybox/glsl.vert'

export class Skybox {
  private programInfo: ProgramInfo
  private gl: WebGL2RenderingContext
  private texture: WebGLTexture
  private cube: BufferInfo

  /**
   * Create a new skybox with 6 textures for each side
   * @param gl GL context
   * @param textureURLs Array of 6 texture URLs, in order: +x, -x, +y, -y, +z, -z
   */
  constructor(gl: WebGL2RenderingContext, textureURLs: string[]) {
    this.gl = gl

    if (textureURLs.length !== 6) {
      throw new Error('💥 Skybox requires 6 textures')
    }

    // Create shader program for skybox rendering
    this.programInfo = createProgramInfo(gl, [vertShaderSkybox, fragShaderSkybox])

    // Create the skybox cube
    this.cube = primitives.createCubeBufferInfo(gl, 1)

    log.info(`🌃 Skybox created!`, textureURLs)

    // Don't go via the texture cache, as cube maps are a special case
    this.texture = createTexture(gl, {
      target: gl.TEXTURE_CUBE_MAP,
      src: textureURLs,
      min: gl.LINEAR_MIPMAP_LINEAR,
      mag: gl.LINEAR,
      cubeFaceOrder: [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      ],
      flipY: 0,
    })
  }

  /**
   * Render the skybox, using the view & projection matrices around the camera
   * @param viewMatrix View matrix
   * @param projMatrix Projection matrix
   * @param camera Camera
   */
  render(viewMatrix: mat4, projMatrix: mat4, camera: Camera) {
    this.gl.useProgram(this.programInfo.program)
    // Note: Disable depth test so skybox is always drawn behind everything else
    this.gl.disable(this.gl.DEPTH_TEST)

    const skyUniforms = {
      u_skyboxTex: this.texture,
      u_worldViewProjection: mat4.create(),
    }

    const world = mat4.create()
    // Skybox magic 1 - translate skybox is always centered on camera
    mat4.translate(world, world, camera.position)
    // Skybox magic 2 - scale the skybox to be the same size as the camera far plane
    // This means it will always be drawn
    mat4.scale(world, world, [camera.far, camera.far, camera.far])

    // Create worldView matrix, used for positioning
    const worldView = mat4.multiply(mat4.create(), viewMatrix, world)

    mat4.multiply(<mat4>skyUniforms.u_worldViewProjection, projMatrix, worldView)

    setBuffersAndAttributes(this.gl, this.programInfo, this.cube)
    setUniforms(this.programInfo, skyUniforms)
    drawBufferInfo(this.gl, this.cube)

    this.gl.enable(this.gl.DEPTH_TEST)
  }
}
