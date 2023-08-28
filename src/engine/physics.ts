import * as CANNON from 'cannon-es'
import { Instance } from '../renderable/instance.ts'
import { PrimitiveCube, PrimitiveSphere } from '../renderable/primitive.ts'
import { quat } from 'gl-matrix'
import { Model } from '../renderable/model.ts'
import { XYZ } from './tuples.ts'

/**
 * Create a new CANNON.Body for a sphere, will link the body to the instance
 * @param inst Instance to create body for
 * @param mass Mass of the body
 * @param material Optional CANNON.Material to use
 */
function createSphereBody(inst: Instance, mass: number, material?: CANNON.Material, offset = [0, 0, 0] as XYZ) {
  if (inst.renderable === undefined) {
    throw new Error('Cannot create body for instance with no renderable')
  }

  let radius = 1
  if (inst.renderable instanceof PrimitiveSphere) {
    radius = (inst.renderable as PrimitiveSphere).radius
  }

  if (inst.renderable instanceof PrimitiveCube) {
    radius = (inst.renderable as PrimitiveCube).size / 2
  }

  if (inst.renderable instanceof Model) {
    // Base the radius on the bounding box of the model
    const boundBox = (inst.renderable as Model).boundingBox

    const x = (boundBox[3] - boundBox[0]) * inst.scale[0]
    const y = (boundBox[4] - boundBox[1]) * inst.scale[1]
    const z = (boundBox[5] - boundBox[2]) * inst.scale[2]

    radius = Math.max(x, y, z) / 2
  }

  const body = new CANNON.Body({
    mass,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    material,
  })

  const offsetVec = new CANNON.Vec3(offset[0], offset[1], offset[2])
  body.addShape(new CANNON.Sphere(radius), offsetVec)

  inst.physicsBody = body
  return body
}

/**
 * Create a new cube/box CANNON.Body enclosing the provided instance. It will attempt fit the box to the
 * instance as best a possible, otherwise will fall back to a 1x1x1 box
 * @param inst Instance to create body for
 * @param mass Mass of the body
 * @param material Optional CANNON.Material to use
 * @param offset Optional offset to apply to the body, useful when models are not centered on origin
 */
function createBoxBody(inst: Instance, mass: number, material?: CANNON.Material, offset = [0, 0, 0] as XYZ) {
  if (inst.renderable === undefined) {
    throw new Error('Cannot create body for instance with no renderable')
  }

  let sizeVec = new CANNON.Vec3(0.5, 0.5, 0.5)

  if (inst.renderable instanceof PrimitiveSphere) {
    const size = (inst.renderable as PrimitiveSphere).radius * 2
    sizeVec = new CANNON.Vec3(size, size, size)
  }

  if (inst.renderable instanceof PrimitiveCube) {
    const size = (inst.renderable as PrimitiveCube).size
    sizeVec = new CANNON.Vec3(size, size, size)
  }

  if (inst.renderable instanceof Model) {
    // Base the size on the bounding box of the model
    const boundBox = (inst.renderable as Model).boundingBox

    sizeVec = new CANNON.Vec3(
      ((boundBox[3] - boundBox[0]) * inst.scale[0]) / 2,
      ((boundBox[4] - boundBox[1]) * inst.scale[1]) / 2,
      ((boundBox[5] - boundBox[2]) * inst.scale[2]) / 2
    )
  }

  const quat = inst.getQuaternion()
  const body = new CANNON.Body({
    mass,
    material,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    quaternion: new CANNON.Quaternion(quat[0], quat[1], quat[2], quat[3]),
  })

  const offsetVec = new CANNON.Vec3(offset[0], offset[1], offset[2])
  body.addShape(new CANNON.Box(sizeVec), offsetVec)

  inst.physicsBody = body
  return body
}

/**
 * Create a new CANNON.Body for a plane, will link the body to the instance
 * @param inst Instance to create body for
 * @param mass Mass of the body
 * @param material Optional CANNON.Material to use
 */
function createPlaneBody(inst: Instance, mass: number, material?: CANNON.Material) {
  const instQuat = inst.getQuaternion()
  const q = quat.fromValues(instQuat[0], instQuat[1], instQuat[2], instQuat[3])

  // Rotate 90 degrees around the X axis, as CANNON.Plane is along the Z axis
  quat.rotateX(q, q, -Math.PI / 2)

  const quaternion = new CANNON.Quaternion(q[0], q[1], q[2], q[3])

  const body = new CANNON.Body({
    mass,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    shape: new CANNON.Plane(),
    material,
    quaternion,
  })

  inst.physicsBody = body
  return body
}

export const Physics = {
  createSphereBody,
  createBoxBody,
  createPlaneBody,
}
