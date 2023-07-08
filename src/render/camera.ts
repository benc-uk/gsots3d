// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { XYZ } from '../core/types.ts'

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
}
