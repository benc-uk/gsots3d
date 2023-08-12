// ===== envmap.ts ==========================================================
// EnvironmentMap class, for rendering reflections
// Ben Coleman, 2023
// ============================================================================

import {
  BufferInfo,
  FramebufferInfo,
  ProgramInfo,
  bindFramebufferInfo,
  createFramebufferInfo,
  createProgramInfo,
  createTexture,
  drawBufferInfo,
  primitives,
  setBuffersAndAttributes,
  setUniforms,
} from 'twgl.js'
import { mat4 } from 'gl-matrix'
import log from 'loglevel'

import { Camera, CameraType } from './camera.ts'
import { XYZ } from './tuples.ts'
import { Context, Stats } from '../index.ts'

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
   * Render this envmap as a cube in, around the given camera & matrices
   * This is used for rendering the envmap as a background and skybox around the scene
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
    Stats.drawCallsPerFrame++

    this.gl.enable(this.gl.DEPTH_TEST)
  }

  get texture(): WebGLTexture {
    return this._texture
  }
}

/**
 * Used for rendering a dynamic environment map, to create realtime reflections
 * For performance reasons, there is only one dynamic envmap per scene context
 */
export class DynamicEnvironmentMap {
  private _texture: WebGLTexture
  private facings: DynamicEnvMapFace[] = []
  private camera: Camera

  /**
   * Create a new dynamic environment map
   * @param gl GL context
   * @param size Size of each face of the cube map
   * @param position Position of the center of the cube map, reflections will be rendered from here
   */
  constructor(gl: WebGL2RenderingContext, size: number, position: XYZ, far: number) {
    // The main texture cubemap
    this._texture = createTexture(gl, {
      target: gl.TEXTURE_CUBE_MAP,
      width: size,
      height: size,
      minMag: gl.LINEAR,
      cubeFaceOrder: [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      ],
    })

    // This array holds the 6 faces of the cube map and the framebuffer info plus direction
    this.facings = [
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        direction: [1, 0, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_X }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        direction: [-1, 0, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        direction: [0, 1, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        direction: [0, -1, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        direction: [0, 0, 1],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        direction: [0, 0, -1],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        ),
      },
    ]

    this.camera = new Camera(CameraType.PERSPECTIVE)
    this.camera.position = position
    this.camera.fov = 90 // 90 degree FOV for cubemap to work properly

    // IMPORTANT: Mark this as a special camera used for envmaps
    this.camera.usedForEnvMap = true

    this.camera.far = far
  }

  /** Get the texture of the environment cubemap  */
  get texture(): WebGLTexture {
    return this._texture
  }

  /**
   * This is used to position the camera for creating the reflection map
   * @param position Position of the center of the cube map
   */
  set position(pos: XYZ) {
    this.camera.position = pos
  }

  /**
   * Update the environment map, by rendering the scene from the given position into the cubemap texture
   * @param ctx GSOTS Context
   */
  update(gl: WebGL2RenderingContext, ctx: Context) {
    // Render each face of the cubemap into the texture & framebuffer
    // NOTE: This requires SIX calls to renderWithCamera!
    for (const facing of this.facings) {
      // Update the camera to look in the direction of the face
      this.camera.lookAt = [
        this.camera.position[0] + facing.direction[0],
        this.camera.position[1] + facing.direction[1],
        this.camera.position[2] + facing.direction[2],
      ]

      // Stops the camera from flipping upside down and other weirdness
      this.camera.up = [0, -1, 0]
      if (facing.face === gl.TEXTURE_CUBE_MAP_NEGATIVE_Y) {
        this.camera.up = [0, 0, -1]
      }
      if (facing.face === gl.TEXTURE_CUBE_MAP_POSITIVE_Y) {
        this.camera.up = [0, 0, 1]
      }

      bindFramebufferInfo(gl, facing.buffer)
      ctx.renderWithCamera(this.camera)
    }
  }
}

/**
 * Internal type for storing a dynamic envmap facing info
 */
export type DynamicEnvMapFace = {
  face: number
  direction: XYZ
  buffer: FramebufferInfo
}
