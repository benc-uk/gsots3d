import { Model, Context, setLogLevel, Material } from '../../dist-bundle/gsots3d.js'

// on lose focus
window.onblur = () => {
  ctx.stop()
}

// on focus
window.onfocus = () => {
  ctx.start()
}

const ctx = await Context.init('canvas')
ctx.shaderProgram = 'gouraud-flat'
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
  floorMat.specular = [0.0, 0.0, 0.0]
  floorMat.shininess = 0
  const floor = ctx.createPlaneInstance(floorMat, 260, 260, 10, 10, 6)
  floor.position = [0, -8, 0]

  const matRed = Material.createSolidColour(0.8, 0.1, 0.1)
  matRed.specular = [1.0, 1.0, 1.0]
  matRed.shininess = 100
  const sphereRed = ctx.createSphereInstance(matRed, 2, 16, 8)
  sphereRed.position = [8, 7, -6]

  const matBlue = Material.createSolidColour(0.1, 0.1, 0.8)
  matBlue.specular = [0.5, 0.5, 0.5]
  matBlue.shininess = 20
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
let camHeight = 30
ctx.camera.position = [0, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 500

// Static light
ctx.defaultLight.position = [70, 150, 120]
ctx.ambientLight = [0.09, 0.09, 0.09]

let angle = Math.PI / 2
let radius = 40

window.onkeydown = (e) => {
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

// Update loop
ctx.update = () => {
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  ctx.camera.position = [x, camHeight, z]
}

ctx.start()
