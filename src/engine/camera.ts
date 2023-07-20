// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { XYZ } from './tuples.ts'

export enum CameraType {
  PERSPECTIVE = 1,
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
  public readonly up: XYZ

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
  }

  /** Get the view matrix for this camera */
  get matrix() {
    const camView = mat4.targetTo(mat4.create(), this.position, this.lookAt, this.up)
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

  toString() {
    // round down position to 2 decimal places
    const pos = this.position.map((p) => Math.round(p * 100) / 100)
    return `position: [${pos}]`
  }

  mouseclicked = false

  enableFPSControls() {
    window.addEventListener('mousedown', () => {
      this.mouseclicked = true
    })

    window.addEventListener('mouseup', () => {
      this.mouseclicked = false
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.mouseclicked) return
      // FPS mouse controls, rotate lookat around camera
      const newLookatX = this.lookAt[0] - this.position[0]
      const newLookatZ = this.lookAt[2] - this.position[2]
      // const newLookatY = this.lookAt[1] - this.position[1]

      // Rotate around Y axis
      const cosY = Math.cos(e.movementX * 0.002)
      const sinY = Math.sin(e.movementX * 0.002)
      const newX = newLookatX * cosY - newLookatZ * sinY
      const newZ = newLookatX * sinY + newLookatZ * cosY

      this.lookAt[0] = this.position[0] + newX
      this.lookAt[2] = this.position[2] + newZ

      // Look up and down, rotate around X axis
      // const cosX = Math.cos(e.movementY * -0.002)
      // const sinX = Math.sin(e.movementY * -0.002)
      // const newY = newLookatY * cosX - newLookatZ * sinX
      // const newZ2 = newLookatY * sinX + newLookatZ * cosX

      // this.lookAt[1] = this.position[1] + newY
      // this.lookAt[2] = this.position[2] + newZ2
    })

    window.addEventListener('keydown', (e) => {
      const dX = (this.lookAt[0] - this.position[0]) * 0.02
      const dZ = (this.lookAt[2] - this.position[2]) * 0.02

      switch (e.key) {
        case 'w':
          this.position[0] += dX
          this.position[2] += dZ
          this.lookAt[0] += dX
          this.lookAt[2] += dZ
          break

        case 's':
          this.position[0] -= dX
          this.position[2] -= dZ
          this.lookAt[0] -= dX
          this.lookAt[2] -= dZ
          break

        case 'a':
          this.position[0] += dZ
          this.position[2] -= dX
          this.lookAt[0] += dZ
          this.lookAt[2] -= dX
          break
        case 'd':
          // move right
          this.position[0] -= dZ
          this.position[2] += dX
          this.lookAt[0] -= dZ
          this.lookAt[2] += dX
          break
      }
    })
  }
}
