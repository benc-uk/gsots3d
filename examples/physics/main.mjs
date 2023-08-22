import { Context, Material, setLogLevel, Physics, Tuples } from '../../dist-bundle/gsots3d.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js'

const ctx = await Context.init()
ctx.camera.position = [0, 60, 150]
ctx.camera.enableFPControls(0.5, -0.24, 0.002, 2.5)
ctx.camera.far = 3000
setLogLevel('info')

ctx.globalLight.setAsPosition(5, 10, 7)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  zoom: 150,
  mapSize: 1024,
  distance: 300,
  polygonOffset: -0.1,
})

const floorMat = Material.createBasicTexture('../_textures/brickwall.jpg')
floorMat.specular = [0.6, 0.6, 0.6]
floorMat.addNormalTexture('../_textures/brickwall_normal.jpg')
const floor = ctx.createCubeInstance(floorMat, 400, 6)
floor.position = [0, -200, 0]
floor.rotate(0, 0, -0.1)
floor.receiveShadow = true

const metalMat = Material.createBasicTexture('../_textures/sci-fi.png')
metalMat.addNormalTexture('../_textures/sci-fi_normal.png')
metalMat.specular = [0.5, 0.5, 0.9]
const sphere = ctx.createSphereInstance(metalMat, 5, 32, 32)
sphere.position = [-150, 125, 0]

const crateMat = Material.createBasicTexture('../_textures/crate.png')
const cube = ctx.createCubeInstance(crateMat, 15)
cube.position = [-50, 11, 0]
cube.rotateY(0.3)
cube.rotateZ(-0.1)

const cube2 = ctx.createCubeInstance(crateMat, 15)
cube2.position = [20, 6, 50]
cube2.rotateY(-0.6)
cube2.rotateZ(-0.1)

const cube3 = ctx.createCubeInstance(crateMat, 15)
cube3.position = [90, -4, -30]
cube3.rotateY(-0.6)
cube3.rotateZ(-0.1)

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0) })

const groundMaterial = new CANNON.Material()
const sphereMat = new CANNON.Material()

const sphereBody = Physics.createSphereBody(sphere, 5, -1, sphereMat)

world.addBody(sphereBody)
world.addBody(Physics.createBoxBody(floor, 0, -1, groundMaterial))
world.addBody(Physics.createBoxBody(cube, 0, -1, groundMaterial))
world.addBody(Physics.createBoxBody(cube2, 0, -1, groundMaterial))
world.addBody(Physics.createBoxBody(cube3, 0, -1, groundMaterial))

const contactMat = new CANNON.ContactMaterial(groundMaterial, sphereMat, {
  friction: 0.85,
  restitution: 0.72,
})

world.addContactMaterial(contactMat)

ctx.update = (delta, now) => {
  world.step(1 / 60, now)
  sphere.position = Tuples.fromCannon(sphereBody.position)
  sphere.setQuaternion(Tuples.fromCannon(sphereBody.quaternion))
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'z') {
    const lc = ctx.globalLight.getShadowCamera()
    ctx.addCamera('lc', lc)
    ctx.setActiveCamera('lc')
  }

  if (e.key === 'x') {
    ctx.setActiveCamera('default')
  }
})

ctx.start()
