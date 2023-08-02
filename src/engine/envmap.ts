// ===== envmap.ts ==========================================================
// EnvironmentMap class, for rendering reflections
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

import fragShaderEnvmap from '../../shaders/envmap/glsl.frag'
import vertShaderEnvmap from '../../shaders/envmap/glsl.vert'

export class EnvironmentMap {
  private programInfo: ProgramInfo
  private gl: WebGL2RenderingContext
  private _texture: WebGLTexture
  private cube: BufferInfo

  /**
   * Render the environment map as a background, like a skybox
   */
  public renderAsBackground: boolean

  /**
   * Create a new environment map with 6 textures for each side
   * @param gl GL context
   * @param textureURLs Array of 6 texture URLs, in order: +x, -x, +y, -y, +z, -z
   */
  constructor(gl: WebGL2RenderingContext, textureURLs: string[]) {
    this.gl = gl

    // Create shader program for special envmap rendering
    this.programInfo = createProgramInfo(gl, [vertShaderEnvmap, fragShaderEnvmap])

    // Create the cube
    this.cube = primitives.createCubeBufferInfo(gl, 1)
    this.renderAsBackground = true

    log.info(`🏔️ EnvironmentMap created!`)

    // Don't go via the texture cache, as cube maps are a special case
    if (textureURLs.length !== 6) {
      throw new Error('💥 Cubemap requires 6 textures')
    }

    this._texture = createTexture(gl, {
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
   * Render the EnvironmentMap, using the view & projection matrices around the camera
   * @param viewMatrix View matrix
   * @param projMatrix Projection matrix
   * @param camera Camera
   */
  render(viewMatrix: mat4, projMatrix: mat4, camera: Camera) {
    if (!this.renderAsBackground) return

    this.gl.useProgram(this.programInfo.program)
    // Note: Disable depth test so envmap is always drawn behind everything else
    this.gl.disable(this.gl.DEPTH_TEST)

    const uniforms = {
      u_envMapTex: this._texture,
      u_worldViewProjection: mat4.create(),
    }

    const world = mat4.create()
    // Envmap magic 1 - translate envmap is always centered on camera
    mat4.translate(world, world, camera.position)
    // Envmap magic 2 - scale the envmap to be the same size as the camera far plane
    // This means it will always be drawn
    mat4.scale(world, world, [camera.far, camera.far, camera.far])

    // Create worldView matrix, used for positioning
    const worldView = mat4.multiply(mat4.create(), viewMatrix, world)

    mat4.multiply(<mat4>uniforms.u_worldViewProjection, projMatrix, worldView)

    setBuffersAndAttributes(this.gl, this.programInfo, this.cube)
    setUniforms(this.programInfo, uniforms)
    drawBufferInfo(this.gl, this.cube)

    this.gl.enable(this.gl.DEPTH_TEST)
  }

  get texture(): WebGLTexture {
    return this._texture
  }
}
