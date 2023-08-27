// ===== node.ts ===============================================================================
// Node in the scene used to position, rotate and scale them, with a parent/child relationship
// Ben Coleman, 2023
// =============================================================================================

import { mat4, quat } from 'gl-matrix'
import { XYZ, XYZW } from './tuples.ts'
import log from 'loglevel'

/**
 * A Node with position, rotation, scale, all Instances extend this class.
 * But Nodes also be created to group instances and simplify transformations.
 */
export class Node {
  public readonly id: string
  public position: XYZ
  public scale: XYZ
  public quaternion: quat
  public enabled: boolean
  public metadata: Record<string, string | number | boolean>
  public receiveShadow: boolean
  public castShadow: boolean
  public parent?: Node

  /** Create a default node, at origin with scale of [1,1,1] and no rotation */
  constructor() {
    // TODO: This is a plain straight up lazy hack
    this.id = uniqueId()
    this.position = [0, 0, 0]
    this.scale = [1, 1, 1]
    this.quaternion = quat.create()
    this.enabled = true
    this.metadata = {}
    this.receiveShadow = true
    this.castShadow = true

    log.debug(`Node created with id ${this.id}`)
  }

  /** Rotate this instance around the X, Y and Z axis in radians */
  rotate(ax: number, ay: number, az: number) {
    quat.rotateX(this.quaternion, this.quaternion, ax)
    quat.rotateY(this.quaternion, this.quaternion, ay)
    quat.rotateZ(this.quaternion, this.quaternion, az)
  }

  /** Rotate this instance around the X axis*/
  rotateX(angle: number) {
    quat.rotateX(this.quaternion, this.quaternion, angle)
  }

  /** Rotate this instance around the Y axis*/
  rotateY(angle: number) {
    quat.rotateY(this.quaternion, this.quaternion, angle)
  }

  /** Rotate this instance around the Z axis, in radians*/
  rotateZ(angle: number) {
    quat.rotateZ(this.quaternion, this.quaternion, angle)
  }

  /** Rotate this instance around the X axis by a given angle in degrees */
  rotateZDeg(angle: number) {
    this.rotateZ((angle * Math.PI) / 180)
  }

  /** Rotate this instance around the Y axis by a given angle in degrees */
  rotateYDeg(angle: number) {
    this.rotateY((angle * Math.PI) / 180)
  }

  /** Rotate this instance around the Z axis by a given angle in degrees */
  rotateXDeg(angle: number) {
    this.rotateX((angle * Math.PI) / 180)
  }

  /** Set the rotation quaternion directly, useful to integrate with physics system */
  setQuaternion(quatArray: XYZW) {
    this.quaternion = quat.fromValues(quatArray[0], quatArray[1], quatArray[2], quatArray[3])
  }

  /** Get the rotation quaternion as a XYZW 4-tuple */
  getQuaternion(): XYZW {
    return [this.quaternion[0], this.quaternion[1], this.quaternion[2], this.quaternion[3]]
  }

  /**
   * Return the world or model matrix for this node, this is the matrix that places this node in the world.
   * This will be in relation to the parent node, if there is one.
   */
  get modelMatrix(): mat4 {
    const modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), this.quaternion, this.position, this.scale)

    if (!this.parent) {
      return modelMatrix
    }

    mat4.multiply(modelMatrix, this.parent.modelMatrix ?? mat4.create(), modelMatrix)

    return modelMatrix
  }

  /** Convenience method to make another node a child of this one */
  addChild(node: Node) {
    node.parent = this
  }

  /** Convenience method to remove a child node */
  removeChild(node: Node) {
    node.parent = undefined
  }
}

/** Generate a unique ID for a node */
function uniqueId() {
  const dateString = Date.now().toString(36).substring(0, 5)
  const randomness = Math.random().toString(36).substring(0, 5)
  return dateString + randomness
}
