// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { XYZ } from './tuples.ts'

export enum CameraType {
  PERSPECTIVE,
  ORTHOGRAPHIC,
}

export class Camera {
  /**
   * Camera position
   * @default [0, 0, 30]
   */
  public position: XYZ

  /**
   * Camera look at point
   * @default [0, 0, 0]
   */
  public lookAt: XYZ

  /**
   * Field of view in degrees, default 45
   * @default 45
   */
  public fov: number

  /**
   * Near clipping plane, default 0.1
   * @default 0.1
   */
  public near: number

  /**
   * Far clipping plane, default 100
   * @default 100
   */
  public far: number

  /**
   * Camera up vector
   * @default [0, 1, 0]
   */
  public up: XYZ

  /**
   * Change camera projection, default perspective
   * @default perspective
   * @see CameraType
   */
  public type: CameraType

  /**
   * Orthographic zoom level, only used when type is orthographic
   * @default 20
   */
  public orthoZoom: number

  private fpAngleY: number
  private fpAngleX: number
  private fpMode: boolean
  private fpTurnSpeed: number
  private fpMoveSpeed: number

  /** Create a new default camera */
  constructor(type = CameraType.PERSPECTIVE) {
    this.position = [0, 0, 30]
    this.lookAt = [0, 0, 0]
    this.up = [0, 1, 0]

    this.near = 0.1
    this.far = 100

    this.fov = 45

    this.type = type
    this.orthoZoom = 20

    this.fpMode = false
    this.fpAngleY = 0
    this.fpAngleX = 0
    this.fpTurnSpeed = 0.003
    this.fpMoveSpeed = 3.5
  }

  /** Get the view matrix for the camera */
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

  /** Get the projection matrix for this camera */
  projectionMatrix(aspectRatio: number) {
    if (this.type === CameraType.ORTHOGRAPHIC) {
      const camProj = mat4.ortho(
        mat4.create(),
        -aspectRatio * this.orthoZoom,
        aspectRatio * this.orthoZoom,
        -this.orthoZoom,
        this.orthoZoom,
        this.near,
        this.far
      )

      return camProj
    } else {
      const camProj = mat4.perspective(mat4.create(), this.fov * (Math.PI / 180), aspectRatio, this.near, this.far)
      return camProj
    }
  }

  /** Get the camera position as a string for debugging */
  toString() {
    // round down position to 2 decimal places
    const pos = this.position.map((p) => Math.round(p * 100) / 100)
    return `position: [${pos}]`
  }

  /**
   * Switches the camera to FPS mode, this is a special mode where the camera is
   * controlled by the mouse and keyboard. The mouse moves the camera around and
   * the keyboard moves the camera forward/backward and left/right
   * @param angleY Starting look up/down angle in radians
   * @param angleX Starting look left/right angle in radians
   * @param turnSpeed Speed of looking in radians
   * @param moveSpeed Speed of moving in units
   * @returns
   */
  enableFPControls(angleY = 0, angleX = 0, turnSpeed = 0.003, moveSpeed = 3.5) {
    if (this.fpMode) return // prevent multiple event listeners

    this.fpMode = true

    this.fpAngleY = angleY
    this.fpAngleX = angleX
    this.fpTurnSpeed = turnSpeed
    this.fpMoveSpeed = moveSpeed

    window.addEventListener('mousemove', this._fpEventMouseMove.bind(this))
    window.addEventListener('keydown', this._fpEventKeyDown.bind(this))
  }

  /** Disable FPS mode */
  disableFPControls() {
    this.fpMode = false
  }

  /** Get FPS mode enabled state */
  get fpModeEnabled() {
    return this.fpMode
  }

  /** Private event handlers for FPS mode */
  private _fpEventMouseMove(e: MouseEvent) {
    if (!this.fpMode) return

    this.fpAngleY += e.movementX * -this.fpTurnSpeed
    this.fpAngleX += e.movementY * -this.fpTurnSpeed
  }

  /** Private event handlers for FPS mode */
  private _fpEventKeyDown(e: KeyboardEvent) {
    if (!this.fpMode) return

    // use fpAngleY to calculate the direction we are facing
    const dZ = -Math.cos(this.fpAngleY) * this.fpMoveSpeed
    const dX = -Math.sin(this.fpAngleY) * this.fpMoveSpeed

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        this.position[0] += dX
        this.position[2] += dZ
        this.lookAt[0] += dX
        this.lookAt[2] += dZ
        break

      case 'ArrowDown':
      case 's':
        this.position[0] -= dX
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
        // move right
        this.position[0] -= dZ
        this.position[2] += dX
        this.lookAt[0] -= dZ
        this.lookAt[2] += dX
        break
    }
  }
}
