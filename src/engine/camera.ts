// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4, vec3 } from 'gl-matrix'
import { XYZ } from './tuples.ts'
import { getGl } from '../core/gl.ts'

import log from 'loglevel'

export enum CameraType {
  PERSPECTIVE,
  ORTHOGRAPHIC,
}

export class Camera {
  /** Camera position */
  public position: XYZ

  /**  Camera look at point, default: [0, 0, 0] */
  public lookAt: XYZ

  /** Field of view in degrees, default: 45 */
  public fov: number

  /** Near clipping plane, default: 0.1 */
  public near: number

  /** Far clipping plane, default: 100 */
  public far: number

  /** Camera up vector, default: [0, 1, 0] */
  public up: XYZ

  /** Change camera projection, default: CameraType.PERSPECTIVE */
  public type: CameraType

  /** Is this camera active, default: true */
  public active: boolean

  /** Orthographic zoom level, only used when type is orthographic, default: 20 */
  public orthoZoom: number

  /** Is this camera used for a dynamic environment map, default: false */
  public usedForEnvMap: boolean

  /** Is this camera used for a shadow map, default: false */
  public usedForShadowMap: boolean

  /** Aspect ratio of the camera, default: 1 */
  public aspectRatio: number

  // Used for first person mode
  private fpAngleY: number
  private fpAngleX: number
  private fpMode: boolean
  private fpHandlersAdded: boolean
  private fpTurnSpeed: number
  public fpMoveSpeed: number
  private fpFly: boolean

  // Used to clamp first person up/down angle
  private maxAngleUp: number = Math.PI / 2 - 0.01
  private maxAngleDown: number = -Math.PI / 2 + 0.01

  // Used to track keys pressed in FP mode for better movement
  private keysDown: Set<string>
  private touches: Touch[] = []

  /**
   * Create a new default camera
   */
  constructor(type = CameraType.PERSPECTIVE, aspectRatio = 1) {
    this.type = type
    this.active = true

    this.position = [0, 0, 30]
    this.lookAt = [0, 0, 0]
    this.up = [0, 1, 0]
    this.near = 0.1
    this.far = 100
    this.fov = 45
    this.aspectRatio = aspectRatio
    this.orthoZoom = 20
    this.usedForEnvMap = false
    this.usedForShadowMap = false

    this.fpMode = false
    this.fpAngleY = 0
    this.fpAngleX = 0
    this.fpTurnSpeed = 0.001
    this.fpMoveSpeed = 1.0
    this.fpHandlersAdded = false
    this.fpFly = false

    this.keysDown = new Set()
  }

  /**
   * Get the current view matrix for the camera
   */
  get matrix() {
    // Standard view matrix with position and lookAt for non-FPS camera
    if (!this.fpMode) {
      const camView = mat4.targetTo(mat4.create(), this.position, this.lookAt, this.up)
      return camView
    }

    // FPS camera is handled different, we need to rotate the camera around the Y axis
    const camView = mat4.targetTo(mat4.create(), [0, 0, 0], [0, 0, -1], this.up)
    mat4.translate(camView, camView, this.position)
    mat4.rotateY(camView, camView, this.fpAngleY)
    mat4.rotateX(camView, camView, this.fpAngleX)

    return camView
  }

  /**
   * Get the projection matrix for this camera
   * @param aspectRatio Aspect ratio of the canvas
   */
  get projectionMatrix() {
    if (this.type === CameraType.ORTHOGRAPHIC) {
      const camProj = mat4.ortho(
        mat4.create(),
        -this.aspectRatio * this.orthoZoom,
        this.aspectRatio * this.orthoZoom,
        -this.orthoZoom,
        this.orthoZoom,
        this.near,
        this.far,
      )

      return camProj
    } else {
      const camProj = mat4.perspective(mat4.create(), this.fov * (Math.PI / 180), this.aspectRatio, this.near, this.far)
      return camProj
    }
  }

  /**
   * Get the center of the camera view frustum
   * @param scale how much to scale the frustum towards the far plane, default: 1
   * @returns Point in world space
   */
  getFrustumCenter(scaleFar = 1) {
    const frustum = this.frustumCornersWorld(scaleFar)
    return [frustum.center[0], frustum.center[1], frustum.center[2]] as XYZ
  }

  /**
   * Get the corners of the view frustum for this camera in world space
   * @param scaleFar Scale the far plane to bring the frustum closer, default: 1
   */
  frustumCornersWorld(scaleFar = 1) {
    const far = this.far * scaleFar
    const nearHeight = Math.tan((this.fov * (Math.PI / 180)) / 2) * this.near
    const nearWidth = nearHeight * this.aspectRatio

    const farHeight = Math.tan((this.fov * (Math.PI / 180)) / 2) * far
    const farWidth = farHeight * this.aspectRatio

    const nearTopLeft = vec3.fromValues(nearWidth, nearHeight, -this.near)
    const nearTopRight = vec3.fromValues(-nearWidth, nearHeight, -this.near)
    const nearBottomLeft = vec3.fromValues(nearWidth, -nearHeight, -this.near)
    const nearBottomRight = vec3.fromValues(-nearWidth, -nearHeight, -this.near)

    const farTopLeft = vec3.fromValues(farWidth, farHeight, -far)
    const farTopRight = vec3.fromValues(-farWidth, farHeight, -far)
    const farBottomLeft = vec3.fromValues(farWidth, -farHeight, -far)
    const farBottomRight = vec3.fromValues(-farWidth, -farHeight, -far)

    const nearTopLeftWorld = vec3.transformMat4(vec3.create(), nearTopLeft, this.matrix)
    const nearTopRightWorld = vec3.transformMat4(vec3.create(), nearTopRight, this.matrix)
    const nearBottomLeftWorld = vec3.transformMat4(vec3.create(), nearBottomLeft, this.matrix)
    const nearBottomRightWorld = vec3.transformMat4(vec3.create(), nearBottomRight, this.matrix)

    const farTopLeftWorld = vec3.transformMat4(vec3.create(), farTopLeft, this.matrix)
    const farTopRightWorld = vec3.transformMat4(vec3.create(), farTopRight, this.matrix)
    const farBottomLeftWorld = vec3.transformMat4(vec3.create(), farBottomLeft, this.matrix)
    const farBottomRightWorld = vec3.transformMat4(vec3.create(), farBottomRight, this.matrix)

    // calculate the center of the frustum
    const center = vec3.create()
    vec3.add(center, nearTopLeftWorld, nearTopRightWorld)
    vec3.add(center, center, nearBottomLeftWorld)
    vec3.add(center, center, nearBottomRightWorld)
    vec3.add(center, center, farTopLeftWorld)
    vec3.add(center, center, farTopRightWorld)
    vec3.add(center, center, farBottomLeftWorld)
    vec3.add(center, center, farBottomRightWorld)
    vec3.scale(center, center, 1 / 8)

    return {
      nearTopLeftWorld,
      nearTopRightWorld,
      nearBottomLeftWorld,
      nearBottomRightWorld,
      farTopLeftWorld,
      farTopRightWorld,
      farBottomLeftWorld,
      farBottomRightWorld,
      center,
    }
  }

  /**
   * Get the camera position as a string for debugging
   */
  toString() {
    const pos = this.position.map((p) => p.toFixed(2))
    return `position: [${pos}]`
  }

  /**
   * Switches the camera to first person mode, where the camera is controlled by
   * the mouse and keyboard. The mouse controls look direction and the keyboard
   * controls movement.
   * @param angleY Starting look up/down angle in radians, default 0
   * @param angleX Starting look left/right angle in radians, default 0
   * @param turnSpeed Speed of looking in radians, default 0.001
   * @param moveSpeed Speed of moving in units, default 1.0
   */
  enableFPControls(angleY = 0, angleX = 0, turnSpeed = 0.001, moveSpeed = 1.0, fly = false) {
    this.fpMode = true
    this.fpAngleY = angleY
    this.fpAngleX = angleX
    this.fpTurnSpeed = turnSpeed
    this.fpMoveSpeed = moveSpeed
    this.fpFly = fly

    if (this.fpHandlersAdded) return // Prevent multiple event listeners being added

    // Handle enable/disable for pointer lock on main canvas
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const gl = getGl()
    gl?.canvas.addEventListener('click', async () => {
      if (!this.fpMode || !this.active) return

      if (document.pointerLockElement) {
        document.exitPointerLock()
      } else {
        await (<HTMLCanvasElement>gl?.canvas).requestPointerLock()
      }
    })

    // Handle mouse movement for looking around
    window.addEventListener('mousemove', (e) => {
      if (!document.pointerLockElement) {
        return
      }

      if (!this.fpMode || !this.active) return
      this.fpAngleY += e.movementX * -this.fpTurnSpeed
      this.fpAngleX += e.movementY * -this.fpTurnSpeed

      // Clamp up/down angle
      if (this.fpAngleX > this.maxAngleUp) this.fpAngleX = this.maxAngleUp
      if (this.fpAngleX < this.maxAngleDown) this.fpAngleX = this.maxAngleDown

      // update the lookAt point
      const dZ = -Math.cos(this.fpAngleY) * 1
      const dX = -Math.sin(this.fpAngleY) * 1
      const dY = Math.sin(this.fpAngleX) * 1

      this.lookAt = [this.position[0] + dX, this.position[1] + dY, this.position[2] + dZ]
    })

    // Track keys pressed for movement
    window.addEventListener('keydown', (e) => {
      if (!this.fpMode || !this.active) return
      this.keysDown.add(e.key)
    })

    window.addEventListener('keyup', (e) => {
      if (!this.fpMode || !this.active) return
      this.keysDown.delete(e.key)
    })

    window.addEventListener('touchstart', (e) => {
      if (!this.fpMode || !this.active) return

      // If the touch is on the right side of the screen, it's for looking
      if (e.touches[0].clientX > window.innerWidth / 2) {
        this.touches[0] = e.touches[0]
      }

      // If the touch is on the left side of the screen, it's for moving
      if (e.touches[0].clientX < window.innerWidth / 2) {
        // Top half of screen is forward, bottom half is backward
        if (e.touches[0].clientY < window.innerHeight / 2) {
          this.keysDown.add('w')
        }
        if (e.touches[0].clientY > window.innerHeight / 2) {
          this.keysDown.add('s')
        }
      }
    })

    window.addEventListener('touchend', () => {
      if (!this.fpMode || !this.active) return

      this.touches = []
      this.keysDown.clear()
    })

    window.addEventListener('touchmove', (e) => {
      if (!this.fpMode || !this.active) return

      if (this.touches.length === 0) return

      const touch = e.touches[0]

      const dx = touch.clientX - this.touches[0].clientX
      const dy = touch.clientY - this.touches[0].clientY

      this.fpAngleY += dx * -this.fpTurnSpeed * touch.force * 4
      this.fpAngleX += dy * -this.fpTurnSpeed * touch.force * 4

      // Clamp up/down angle
      if (this.fpAngleX > this.maxAngleUp) this.fpAngleX = this.maxAngleUp
      if (this.fpAngleX < this.maxAngleDown) this.fpAngleX = this.maxAngleDown

      this.touches[0] = touch
    })

    this.fpHandlersAdded = true
    log.info('🎥 Camera: first person mode & controls enabled')
  }

  /**
   * Disable FP mode
   */
  disableFPControls() {
    this.fpMode = false
    document.exitPointerLock()
    log.debug('🎥 Camera: FPS mode disabled')
  }

  /**
   * Get FP mode state
   */
  get fpModeEnabled() {
    return this.fpMode
  }

  /**
   * Called every frame to update the camera, currently only used for movement in FP mode
   */
  update() {
    if (!this.fpMode || !this.active) return
    if (this.keysDown.size === 0) return

    // Use fpAngleY to calculate the direction we are facing
    const dZ = -Math.cos(this.fpAngleY) * this.fpMoveSpeed
    const dY = Math.sin(this.fpAngleX) * this.fpMoveSpeed
    const dX = -Math.sin(this.fpAngleY) * this.fpMoveSpeed

    // Use keysDown to move the camera
    for (const key of this.keysDown.values()) {
      switch (key) {
        case 'ArrowUp':
        case 'w':
          this.position[0] += dX
          if (this.fpFly) this.position[1] += dY
          this.position[2] += dZ
          this.lookAt[0] += dX
          this.lookAt[2] += dZ
          break

        case 'ArrowDown':
        case 's':
          this.position[0] -= dX
          if (this.fpFly) this.position[1] -= dY
          this.position[2] -= dZ
          this.lookAt[0] -= dX
          this.lookAt[2] -= dZ
          break

        case 'ArrowLeft':
        case 'a':
          this.position[0] += dZ
          this.position[2] -= dX
          this.lookAt[0] += dZ
          this.lookAt[2] -= dX
          break

        case 'ArrowRight':
        case 'd':
          // Move right
          this.position[0] -= dZ
          this.position[2] += dX
          this.lookAt[0] -= dZ
          this.lookAt[2] += dX
          break

        case ']':
          // Move up
          this.position[1] += this.fpMoveSpeed * 0.75
          this.lookAt[1] += this.fpMoveSpeed * 0.75
          break

        case '[':
          // Move down
          this.position[1] -= this.fpMoveSpeed * 0.75
          this.lookAt[1] -= this.fpMoveSpeed * 0.75
          break
      }
    }
  }
}
