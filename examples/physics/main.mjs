import { Context, Material, setLogLevel, Physics, Tuples } from '../../dist-bundle/gsots3d.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js'

const ctx = await Context.init()
ctx.camera.position = [0, 130, 250]
ctx.camera.enableFPControls(0.5, -0.24, 0.002, 4)
ctx.camera.far = 3000
setLogLevel('info')

ctx.globalLight.setAsPosition(5, 20, 12)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  zoom: 1200,
  mapSize: 2048,
})

const floorMat = Material.createBasicTexture('../_textures/brickwall.jpg')
floorMat.diffuse = [0.9, 1.0, 0.9]
floorMat.specular = [1, 1, 1]
floorMat.addNormalTexture('../_textures/brickwall_normal.jpg')
const floor = ctx.createPlaneInstance(floorMat, 2000, 2000, 1, 1, 6)
floor.rotate(0, 0, -0.1)
floor.receiveShadow = true

const metalMat = Material.createBasicTexture('../_textures/sci-fi.png')
metalMat.addNormalTexture('../_textures/sci-fi_normal.png')
metalMat.specular = [0.5, 0.5, 0.9]
const sphere = ctx.createSphereInstance(metalMat, 30, 32, 32)
sphere.position = [-290, 225, 0]

const crateMat = Material.createBasicTexture('../_textures/crate.png')
const cube = ctx.createCubeInstance(crateMat, 80)
cube.position = [0, 40, -20]
cube.rotateY(0.3)
cube.rotateZ(-0.1)

const cube2 = ctx.createCubeInstance(crateMat, 80)
cube2.position = [380, 4, 170]
cube2.rotateY(-0.6)
cube2.rotateZ(-0.1)

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0) })

const groundMaterial = new CANNON.Material()
const sphereMat = new CANNON.Material()

const sphereBody = Physics.createSphereBody(sphere, 15, -1, sphereMat)
const groundBody = Physics.createPlaneBody(floor, 0, groundMaterial)
const cubeBody = Physics.createBoxBody(cube, 0, -1, groundMaterial)
const cubeBody2 = Physics.createBoxBody(cube2, 0, -1, groundMaterial)

world.addBody(groundBody)
world.addBody(sphereBody)
world.addBody(cubeBody)
world.addBody(cubeBody2)

const contactMat = new CANNON.ContactMaterial(groundMaterial, sphereMat, {
  friction: 0.85,
  restitution: 0.72,
})

world.addContactMaterial(contactMat)

ctx.update = (delta, now) => {
  world.step(delta, now)
  sphere.position = Tuples.fromCannon(sphereBody.position)
  sphere.setQuaternion(Tuples.fromCannon(sphereBody.quaternion))
}

ctx.start()
