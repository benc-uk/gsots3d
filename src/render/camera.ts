// ===== camera.ts ============================================================
// Represents a camera in 3D space
// Ben Coleman, 2023
// ============================================================================

import { mat4 } from 'gl-matrix'

export class Camera {
  /**
   * Camera position
   * @default [0, 0, 30]
   */
  public position: [number, number, number] = [0, 0, 30]

  /**
   * Camera look at point
   * @default [0, 0, 0]
   */
  public lookAt: [number, number, number] = [0, 0, 0]

  /**
   * Field of view in degrees, default 45
   * @default 45
   */
  public fov = 45

  /**
   * Near clipping plane, default 0.1
   * @default 0.1
   */
  public near = 0.1

  /**
   * Far clipping plane, default 100
   * @default 100
   */
  public far = 100

  /**
   * Camera up vector
   * @default [0, 1, 0]
   */
  public readonly up: [number, number, number] = [0, 1, 0]

  constructor() {
    // Empty
  }

  /**
   * Get the view matrix for this camera
   */
  public get viewMatrix(): mat4 {
    const camView = mat4.targetTo(mat4.create(), this.position, this.lookAt, this.up)
    return camView
  }

  /**
   * Get the projection matrix for this camera
   */
  public projectionMatrix(aspectRatio: number): mat4 {
    const camProj = mat4.perspective(mat4.create(), this.fov * (Math.PI / 180), aspectRatio, this.near, this.far)
    return camProj
  }
}
