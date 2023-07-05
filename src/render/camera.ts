// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'
import { XYZ } from '../core/types.ts'

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

  constructor() {
    this.position = [0, 0, 30]
    this.lookAt = [0, 0, 0]
    this.up = [0, 1, 0]

    this.near = 0.1
    this.far = 100

    this.fov = 45
  }

  /**
   * Get the view matrix for this camera
   */
  get matrix(): mat4 {
    const camView = mat4.targetTo(mat4.create(), this.position, this.lookAt, this.up)
    return camView
  }

  /**
   * Get the projection matrix for this camera
   */
  projectionMatrix(aspectRatio: number): mat4 {
    const camProj = mat4.perspective(mat4.create(), this.fov * (Math.PI / 180), aspectRatio, this.near, this.far)
    return camProj
  }
}
