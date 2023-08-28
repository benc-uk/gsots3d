import { Context, Material, Physics } from '../../dist-single/gsots3d.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js'

const ctx = await Context.init()
ctx.camera.position = [0, 110, 150]
ctx.camera.enableFPControls(0.5, -0.44, 0.002, 2.5)
ctx.camera.far = 3000
ctx.setLogLevel('info')

ctx.globalLight.setAsPosition(5, 10, 7)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  zoom: 400,
  mapSize: 4096,
  distance: 400,
  polygonOffset: -0.1,
})

const floorMat = Material.createBasicTexture('../_textures/brickwall.jpg')
floorMat.specular = [0.6, 0.6, 0.6]
floorMat.addNormalTexture('../_textures/brickwall_normal.jpg')
const floor = ctx.createCubeInstance(floorMat, 400, 6)
floor.position = [0, -200, 0]
floor.rotate(0, 0, -0.1)
floor.receiveShadow = true

const metalMat = Material.createSolidColour(0.2, 0.2, 0.25)
metalMat.specular = [0.5, 0.5, 0.9]
metalMat.reflectivity = 0.9
const crateMat = Material.createBasicTexture('../_textures/crate.png')

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0) })

const groundMaterial = new CANNON.Material()
const sphereMat = new CANNON.Material()

world.addBody(Physics.createBoxBody(floor, 0, -1, groundMaterial))

const contactMat = new CANNON.ContactMaterial(groundMaterial, sphereMat, {
  friction: 0.15,
  restitution: 0.52,
})

world.addContactMaterial(contactMat)
ctx.physicsWorld = world

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    addBall()
  }
})

addBall()

ctx.setEnvmap(
  true,
  '../_textures/skybox-2/posx.png',
  '../_textures/skybox-2/negx.png',
  '../_textures/skybox-2/posy.png',
  '../_textures/skybox-2/negy.png',
  '../_textures/skybox-2/posz.png',
  '../_textures/skybox-2/negz.png'
)

ctx.setDynamicEnvmap([0, 25, 0], 512, 200)
ctx.start()

for (let c = 0; c < 30; c++) {
  addCrate()
}

const note = document.createElement('div')
note.innerHTML = 'Press space to drop a ball'
note.style.width = '100%'
note.style.textAlign = 'center'
note.style.fontSize = '2vw'
note.style.textShadow = '3px 3px 2px rgba(0,0,0,0.8)'
ctx.hud.addHUDItem(note)

function addBall() {
  const sphere = ctx.createSphereInstance(metalMat, 7, 32, 32)
  sphere.position = [-150, 125, Math.random() * 300 - 150]
  const sphereBody = Physics.createSphereBody(sphere, 5, -1, sphereMat)
  world.addBody(sphereBody)
}

function addCrate() {
  const crate = ctx.createCubeInstance(crateMat, 20)
  const x = Math.random() * 300 - 150
  crate.position = [x, 1 - x / 8 + 5, Math.random() * 300 - 150]
  crate.rotateYDeg(Math.random() * 360)
  const crateBody = Physics.createBoxBody(crate, 0, -1, floorMat)
  world.addBody(crateBody)
}
