// ===== light.ts =============================================================
// All light types, including directional and point
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import * as twgl from 'twgl.js'

import { UniformSet, getGl } from '../core/gl.ts'
import { Camera, CameraType } from './camera.ts'
import { Colours, Tuples, XYZ, RGB } from './tuples.ts'

import fragShaderShadow from '../../shaders/shadowmap/glsl.frag'
import vertShaderShadow from '../../shaders/shadowmap/glsl.vert'

/**
 * Options to configure how shadows are calculated & rendered
 */
export type ShadowOptions = {
  /** Size of the shadow map texture. Default: 512 */
  mapSize: number

  /** Zoom level of the shadow map camera, larger will cover more of the scene, but results in more blocky shadows. Default 120 */
  zoom: number

  /** Far clipping pane of shadow map camera, default 1000 */
  distance: number

  /** Blur the edges of shadows, higher values them more random, default 0.2 */
  // scatter: number

  /** Offset used to reduce shadow acne especially when self shadowing */
  polygonOffset: number
}

/**
 * A directional light source, typically global with the context having only a single instance
 * Having multiple directional lights is not supported
 */
export class LightDirectional {
  private _direction: XYZ
  private _shadowMapProgram?: twgl.ProgramInfo
  private _shadowMapFB?: twgl.FramebufferInfo
  private _shadowMapTex?: WebGLTexture
  private _shadowOptions?: ShadowOptions
  public shadowViewOffset: XYZ

  /** Colour of the light, used for both diffuse and specular. Default: [0, 0, 0] */
  public colour: RGB

  /** Ambient colour of the light. Default: [0, 0, 0] */
  public ambient: RGB

  /** Is this light enabled. Default: true */
  public enabled: boolean

  /** Create a default directional light, pointing downward */
  constructor() {
    this._direction = [0, -1, 0]
    this.colour = Colours.WHITE
    this.ambient = Colours.BLACK
    this.enabled = true
    this.shadowViewOffset = [0, 0, 0]

    const gl = getGl()
    if (!gl) {
      throw new Error('💥 LightDirectional: Cannot create shadow map shader, no GL context')
    }

    this._shadowMapProgram = twgl.createProgramInfo(gl, [vertShaderShadow, fragShaderShadow], ['shadowProgram'])
  }

  /**
   * Set the direction of the light ensuring it is normalized
   * @param direction - Direction vector
   */
  set direction(direction: XYZ) {
    // Ensure direction is normalized
    this._direction = Tuples.normalize(direction)
  }

  /**
   * Get the direction of the light
   */
  get direction() {
    return this._direction
  }

  /**
   * Convenience method allows setting the direction as a point relative to the world origin
   * Values are always converted to a normalized unit direction vector
   * @param x - X position
   * @param y - Y position
   * @param z - Z position
   */
  setAsPosition(x: number, y: number, z: number) {
    this._direction = Tuples.normalize([0 - x, 0 - y, 0 - z])
  }

  /**
   * Return the base set of uniforms for this light
   */
  get uniforms() {
    return {
      direction: this.direction,
      colour: this.enabled ? this.colour : [0, 0, 0],
      ambient: this.ambient ? this.ambient : [0, 0, 0],
    } as UniformSet
  }

  /**
   * Enable shadows for this light, this will create a shadow map texture and framebuffer
   * There is no way to disabled shadows once enabled
   * @param options A set of ShadowOptions to configure how shadows are calculated
   */
  enableShadows(options?: ShadowOptions) {
    this._shadowOptions = options ?? ({} as ShadowOptions)
    if (!this._shadowOptions.mapSize) {
      this._shadowOptions.mapSize = 512
    }
    if (!this._shadowOptions.zoom) {
      this._shadowOptions.zoom = 120
    }
    if (!this._shadowOptions.distance) {
      this._shadowOptions.distance = 1000
    }
    // if (!this._shadowOptions.scatter) {
    //   this._shadowOptions.scatter = 0.22
    // }
    if (!this._shadowOptions.polygonOffset) {
      this._shadowOptions.polygonOffset = 0
    }

    const gl = getGl()
    if (!gl) {
      throw new Error('💥 LightDirectional: Cannot create shadow map, no GL context')
    }

    // This is a special type of texture, used for depth comparison and shadow mapping
    this._shadowMapTex = twgl.createTexture(gl, {
      width: this._shadowOptions.mapSize,
      height: this._shadowOptions.mapSize,
      internalFormat: gl.DEPTH_COMPONENT32F, // Makes this a depth texture
      compareMode: gl.COMPARE_REF_TO_TEXTURE, // Becomes a shadow map, e.g. sampler2DShadow
      minMag: gl.LINEAR, // Can be linear sampled only if compare mode is set
    })

    // Framebuffer to render the shadow map into
    this._shadowMapFB = twgl.createFramebufferInfo(
      gl,
      [{ attachment: this._shadowMapTex, attachmentPoint: gl.DEPTH_ATTACHMENT }],
      this._shadowOptions.mapSize,
      this._shadowOptions.mapSize
    )
  }

  /**
   * Get a virtual camera that can be used to render a shadow map for this light
   * @param zoomLevel - Zoom level of the camera, default: 30
   * @param aspectRatio - Aspect ratio of the camera, default: 1
   */
  getShadowCamera() {
    if (!this._shadowOptions) {
      return undefined
    }

    const moveDist = this._shadowOptions.distance * 0.9

    const cam = new Camera(CameraType.ORTHOGRAPHIC, 4 / 3)
    cam.orthoZoom = this._shadowOptions.zoom
    cam.lookAt = [0, 0, 0]
    cam.position = [-this.direction[0] * moveDist, -this.direction[1] * moveDist, -this.direction[2] * moveDist]
    cam.usedForShadowMap = true
    cam.far = this._shadowOptions.distance * 2

    cam.position[0] += this.shadowViewOffset[0]
    cam.position[1] += this.shadowViewOffset[1]
    cam.position[2] += this.shadowViewOffset[2]
    cam.lookAt[0] += this.shadowViewOffset[0]
    cam.lookAt[1] += this.shadowViewOffset[1]
    cam.lookAt[2] += this.shadowViewOffset[2]

    return cam
  }

  /**
   * Get the forward view matrix for the virtual camera used to render the shadow map.
   * Returns undefined if shadows are not enabled
   */
  get shadowMatrix() {
    if (!this._shadowOptions) {
      return undefined
    }

    const shadowCam = this.getShadowCamera()
    if (!shadowCam) {
      return undefined
    }

    const shadowMat = mat4.multiply(
      mat4.create(),
      shadowCam.projectionMatrix,
      mat4.invert(mat4.create(), shadowCam.matrix)
    )

    return shadowMat
  }

  /**
   * Are shadows enabled for this light?
   */
  get shadowsEnabled() {
    return this._shadowOptions !== undefined
  }

  /**
   * Get the shadow map program, will be undefined if shadows are not enabled
   */
  get shadowMapProgram() {
    return this._shadowMapProgram
  }

  /**
   * Get the shadow map framebuffer, will be undefined if shadows are not enabled
   */
  get shadowMapFrameBufffer() {
    return this._shadowMapFB
  }

  /**
   * Get the shadow map texture, will be undefined if shadows are not enabled
   */
  get shadowMapTexture() {
    return this._shadowMapTex
  }

  /**
   * Get the shadow map options, will be undefined if shadows are not enabled
   */
  get shadowMapOptions() {
    return this._shadowOptions
  }
}

/*
 * A point light source, doesn't cast shadows but does attenuate with distance
 */
export class LightPoint {
  /** Position of the light in world space. */
  public position: XYZ

  /** Colour of the light. Default: [1, 1, 1] */
  public colour: RGB

  /** Ambient colour of the light. Normally none for point lights. Default [0, 0, 0] */
  public ambient: RGB

  /** Light attenuation parameter for constant drop off rate. Default: 0.5 */
  public constant: number

  /** Light attenuation parameter for linear drop off rate. Default: 0.018 */
  public linear: number

  /** Light attenuation parameter for quadratic drop off rate. Default: 0.0003 */
  public quad: number

  /** Is this light enabled? Default: true */
  public enabled: boolean

  /**
   * Create a default point light, positioned at the world origin
   * @param position - Position of the light in world space
   * @param colour - Colour of the light
   * @param constant - Attenuation constant drop off rate, default 0.5
   * @param linear - Attenuation linear drop off rate, default 0.018
   * @param quad - Attenuation quadratic drop off rate, default 0.0003
   */
  constructor(position: XYZ, colour: RGB, constant = 0.5, linear = 0.018, quad = 0.0003) {
    this.position = position
    this.colour = colour
    this.constant = constant
    this.linear = linear
    this.quad = quad

    // No ambient contribution by default, this can get messy otherwise
    this.ambient = Colours.BLACK
    this.enabled = true
  }

  /**
   * Return the base set of uniforms for this light
   */
  public get uniforms() {
    return {
      enabled: this.enabled,
      quad: this.quad,
      position: this.position,
      colour: this.colour,
      ambient: this.ambient,
      constant: this.constant,
      linear: this.linear,
    } as UniformSet
  }
}
