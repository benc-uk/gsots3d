// ===== node.ts ===============================================================================
// Node in the scene used to position, rotate and scale them, with a parent/child relationship
// Ben Coleman, 2023
// =============================================================================================

import { mat4, quat } from 'gl-matrix'
import { Tuples, XYZ, XYZW } from './tuples.ts'

import log from 'loglevel'
import * as CANNON from 'cannon-es'

const EVENT_POSITION = 'position'

/** Event triggered when a node position, rotation or scale changes */
export type NodeEvent = {
  position: XYZ
  rotation: XYZW
  scale: XYZ
  nodeId: string
}

/**
 * A Node with position, rotation, scale, all Instances extend this class.
 * But Nodes also be created to group instances and simplify transformations.
 */
export class Node {
  /** Unique ID for this node */
  public readonly id: string

  /** Position of this Node in world space, relative to any parent nodes (if any) */
  public position: XYZ

  /** Scale of this Node in world space, relative to any parent nodes (if any) */
  public scale: XYZ

  /** Rotation quaternion of this Node in world space, relative to any parent nodes (if any) */
  public quaternion: quat

  /** Metadata is a key/value store for any extra data you want to store on a node */
  public metadata: Record<string, string | number | boolean>

  // Private properties with getters/setters
  private _receiveShadow: boolean
  private _castShadow: boolean
  private _enabled: boolean
  private _parent?: Node
  private _children: Node[] = []
  private _physicsBody?: CANNON.Body

  // Event handlers
  private eventHandlers: Map<string, ((event: NodeEvent) => void)[]>

  /** Create a default node, at origin with scale of [1,1,1] and no rotation */
  constructor() {
    this.id = uniqueId()
    this.metadata = {}
    this.eventHandlers = new Map()
    this.eventHandlers.set(EVENT_POSITION, [])

    this.position = [0, 0, 0]
    this.scale = [1, 1, 1]
    this.quaternion = quat.create()

    this._enabled = true
    this._receiveShadow = true
    this._castShadow = true
    this._physicsBody = undefined

    log.debug(`📍 Node created with id ${this.id}`)
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

  /** Set the rotation quaternion directly, normally users should use the rotate methods.
   * This method is for advanced uses, like integration with an external physics system */
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

  /** Convenience method to make another Node a child of this one */
  addChild(node: Node) {
    node._parent = this

    this._children.push(node)
  }

  /** Convenience method to remove a child Node */
  removeChild(node: Node) {
    node._parent = undefined

    this._children = this._children.filter((child) => child.id !== node.id)
  }

  /** Convenience method to remove all child Nodes */
  removeAllChildren() {
    this._children.forEach((child) => {
      child._parent = undefined
    })

    this._children = []
  }

  /** Sets the parent this Node, to the provided Node */
  set parent(node: Node | undefined) {
    // remove from old parent if there is one
    if (this._parent) {
      this._parent.removeChild(this)
    }

    // Add to new parent if there is one
    if (node) {
      node.addChild(this)
    }
  }

  /** Fetch all child Nodes of this Node */
  get children(): Node[] {
    return this._children
  }

  /** Get current parent of this Node */
  get parent(): Node | undefined {
    return this._parent
  }

  /** Is this Node enabled. Disabled nodes will not be rendered */
  get enabled(): boolean {
    return this._enabled
  }

  /** Set enabled state of this Node, this will also set all child nodes */
  set enabled(enabled: boolean) {
    this._enabled = enabled

    this._children.forEach((child) => {
      child.enabled = enabled
    })
  }

  /** Does this Node cast shadows, default true  */
  public get castShadow(): boolean {
    return this._castShadow
  }

  /** Set will this Node cast shadows, this will also set all child nodes */
  public set castShadow(value: boolean) {
    this._castShadow = value

    this._children.forEach((child) => {
      child.castShadow = value
    })
  }

  /** Does this Node receive shadows, default true */
  public get receiveShadow(): boolean {
    return this._receiveShadow
  }

  /** Set will this Node receive shadows, this will also set all child nodes */
  public set receiveShadow(value: boolean) {
    this._receiveShadow = value

    this._children.forEach((child) => {
      child.receiveShadow = value
    })
  }

  /** Get the physics body for this Node, if there is one */
  public get physicsBody(): CANNON.Body | undefined {
    return this._physicsBody
  }

  /** Set the physics body for this Node */
  public set physicsBody(body: CANNON.Body | undefined) {
    this._physicsBody = body
  }

  /**
   * Updates the position & rotation of this node to match it's linked physics Body
   * This is called automatically by the engine, but can be called manually if needed
   */
  public updateFromPhysicsBody() {
    if (!this._physicsBody) return

    this.position = Tuples.fromCannon(this._physicsBody.position) as XYZ
    this.setQuaternion(Tuples.fromCannon(this._physicsBody.quaternion) as XYZW)

    // Trigger position event handlers
    for (const handler of this.eventHandlers.get(EVENT_POSITION) ?? []) {
      handler({
        position: this.position,
        rotation: this.getQuaternion(),
        scale: this.scale,
        nodeId: this.id,
      })
    }
  }

  /**
   * Add an event handler to listen for node changes
   * @param event NodeEvent type, one of 'position', 'rotation', 'scale'
   * @param handler Function to call when event is triggered
   */
  addEventHandler(event: string, handler: (event: NodeEvent) => void) {
    this.eventHandlers.get(event)?.push(handler)
  }
}

/** Generate a unique ID for a node */
function uniqueId() {
  const dateString = Date.now().toString(36).substring(0, 5)
  const randomness = Math.random().toString(36).substring(0, 5)
  return dateString + randomness
}
