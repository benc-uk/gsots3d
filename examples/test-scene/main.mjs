import { Model, Context, setLogLevel, Material, LightPoint, BLACK } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init('canvas')
ctx.debug = true
setLogLevel('debug')

// Setup scene
{
  ctx.models.add(await Model.parse('../objects', 'table.obj'))
  ctx.models.add(await Model.parse('../objects', 'chest.obj'))
  ctx.models.add(await Model.parse('../objects', 'block.obj'))

  const table = ctx.createModelInstance('table')
  table.position = [5, 2.5, -4]
  table.scale = [2.1, 1.5, 2.7]
  table.rotateX(Math.PI / 2)

  const chest1 = ctx.createModelInstance('chest')
  chest1.position = [-10, 0, 0]

  const chest2 = ctx.createModelInstance('chest')
  chest2.position = [13, 0, 11]
  chest2.rotateY(Math.PI / 1.5)

  const block = ctx.createModelInstance('block')
  block.position = [-12, -6, 28]
  block.scale = [0.5, 0.5, 0.5]
  block.rotateY(1.2)

  const floorMat = Material.createBasicTexture('../textures/stone-wall.png')
  floorMat.specular = BLACK
  floorMat.shininess = 100
  const floor = ctx.createPlaneInstance(floorMat, 260, 260, 10, 10, 6)
  floor.position = [0, -8, 0]

  const matRed = Material.createSolidColour(1.0, 1.0, 1.0)
  matRed.specular = [1.0, 1.0, 1.0]
  matRed.shininess = 100
  const sphereRed = ctx.createSphereInstance(matRed, 2, 16, 8)
  sphereRed.position = [8, 7, -6]

  const matBlue = Material.createSolidColour(0.1, 0.1, 0.8)
  matBlue.specular = [0.4, 0.4, 0.4]
  matBlue.shininess = 6
  const sphereBlue = ctx.createSphereInstance(matBlue, 2, 16, 8)
  sphereBlue.position = [14, 7, -8]

  const mellonTx = Material.createBasicTexture('../textures/mellon.jpg')
  const mellon = ctx.createSphereInstance(mellonTx, 3, 32, 16)
  mellonTx.diffuse = [0.7, 1.4, 0.7]
  mellonTx.specular = [1.0, 1.0, 1.0]
  mellonTx.shininess = 25
  mellon.position = [11, 8, -13]

  const crateMat = Material.createBasicTexture('../textures/crate.png')
  crateMat.addSpecularTexture('../textures/crate-specular.png')
  crateMat.shininess = 40
  crateMat.specular = [2.0, 2.0, 2.0]
  const cube = ctx.createCubeInstance(crateMat, 15)
  cube.rotateY(Math.PI / 4)
  cube.position = [-13, 0, -18]
}

// Camera
let camHeight = 40
ctx.camera.position = [0, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 500

// Lights
ctx.globalLight.setAsPosition(260, 150, 120)
ctx.globalLight.colour = [0.9, 0.9, 0.9]
ctx.globalLight.ambient = [0.01, 0.01, 0.01]

const light1 = new LightPoint()
light1.position = [-30, 19, -60]
light1.colour = [0.0, 0.99, 0.0]
light1.ambient = [0.0, 0.0, 0.0]
ctx.lights.push(light1)

const light2 = new LightPoint()
light2.position = [10, 30, 60]
light2.colour = [1.0, 0.0, 0.4]
light2.ambient = [0.0, 0.0, 0.0]
ctx.lights.push(light2)

let angle = 1.1
let radius = 50

window.onkeydown = (e) => {
  autoRotate = false
  // rotate camera
  if (e.key === 'ArrowLeft') {
    angle += 0.03
  }

  if (e.key === 'ArrowRight') {
    angle -= 0.03
  }

  // move camera up & down
  if (e.key === 'ArrowUp') {
    radius = Math.max(radius - 1, 1)
  }

  if (e.key === 'ArrowDown') {
    radius = Math.min(radius + 1, 100)
  }

  // change height
  if (e.key === 'PageUp') {
    camHeight = Math.min(camHeight + 1, 100)
  }

  if (e.key === 'PageDown') {
    camHeight = Math.max(camHeight - 1, 1)
  }

  // debug
  if (e.key === 'd') {
    ctx.debug = !ctx.debug
  }

  // fov
  if (e.key === 'f') {
    ctx.camera.fov = Math.max(ctx.camera.fov - 1, 1)
  }

  if (e.key === 'g') {
    ctx.camera.fov = Math.min(ctx.camera.fov + 1, 179)
  }
}

let autoRotate = true

// Update loop
ctx.update = (delta) => {
  if (autoRotate) {
    angle += delta * 0.4
  }

  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  ctx.camera.position = [x, camHeight, z]
}

ctx.start()
