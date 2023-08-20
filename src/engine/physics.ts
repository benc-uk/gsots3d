import * as CANNON from 'cannon-es'
import { Instance } from '../models/instance.ts'
import { PrimitiveCube, PrimitiveSphere } from '../models/primitive.ts'
import { quat } from 'gl-matrix'

/**
 * Create a new CANNON.Body for a sphere
 * @param inst Instance to create body for
 * @param mass Mass of the body
 * @param radius Radius of the sphere, if instance is a PrimitiveSphere this is ignored and instance radius is used
 * @param material Optional CANNON.Material to use
 */
function createSphereBody(inst: Instance, mass: number, radius: number, material?: CANNON.Material) {
  if (inst.renderable === undefined) {
    throw new Error('Cannot create body for instance with no renderable')
  }

  if (inst.renderable instanceof PrimitiveSphere) {
    radius = (inst.renderable as PrimitiveSphere).radius
  }

  if (inst.renderable instanceof PrimitiveCube) {
    radius = (inst.renderable as PrimitiveCube).size / 2
  }

  return new CANNON.Body({
    mass,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    shape: new CANNON.Sphere(radius),
    material,
  })
}

/**
 * Create a new CANNON.Body for a box
 * @param inst Instance to create body for
 * @param mass Mass of the body
 * @param size Size of the box, if instance is a PrimitiveBox this is ignored and instance size is used
 * @param material Optional CANNON.Material to use
 */
function createBoxBody(inst: Instance, mass: number, size: number, material?: CANNON.Material) {
  if (inst.renderable === undefined) {
    throw new Error('Cannot create body for instance with no renderable')
  }

  if (inst.renderable instanceof PrimitiveSphere) {
    size = (inst.renderable as PrimitiveSphere).radius * 2
  }

  if (inst.renderable instanceof PrimitiveCube) {
    size = (inst.renderable as PrimitiveCube).size
  }

  const quat = inst.getQuaternion()
  return new CANNON.Body({
    mass,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
    material,
    quaternion: new CANNON.Quaternion(quat[0], quat[1], quat[2], quat[3]),
  })
}

/**
 * Create a new CANNON.Body for a plane
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

  return new CANNON.Body({
    mass,
    position: new CANNON.Vec3(inst.position[0], inst.position[1], inst.position[2]),
    shape: new CANNON.Plane(),
    material,
    quaternion,
  })
}

export const Physics = {
  createSphereBody,
  createBoxBody,
  createPlaneBody,
}
