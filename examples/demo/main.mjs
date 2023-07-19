import { Model, Context, Material, BillboardType, Colours } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init('canvas')
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

// Setup scene
{
  ctx.models.add(await Model.parse('../_objects', 'table.obj'))
  ctx.models.add(await Model.parse('../_objects', 'chest.obj'))
  ctx.models.add(await Model.parse('../_objects', 'treasure_chest.obj'))
  ctx.models.add(await Model.parse('../_objects', 'icosahedron.obj'))
  ctx.models.add(await Model.parse('../_objects', 'teapot.obj'))
  ctx.models.add(await Model.parse('../_objects', 'wine.obj'))

  const table = ctx.createModelInstance('table')
  table.position = [16, 0, -15]
  table.rotateXDeg(-90)
  table.rotateZDeg(-12)
  table.scale = [0.2, 0.3, 0.5]

  const chest1 = ctx.createModelInstance('treasure_chest')
  chest1.position = [-23, 0, 2]
  chest1.rotateXDeg(-90)
  chest1.rotateZDeg(66)

  const chest2 = ctx.createModelInstance('treasure_chest')
  chest2.scale = [1.4, 1.4, 1.4]
  chest2.position = [13, 0, 6]
  chest2.rotateXDeg(-90)

  const bb = ctx.createBillboardInstance('../_textures/doom-imp.png', 22, 22, BillboardType.SPHERICAL)
  bb.position = [-4, 11, -4]

  const floorMat = Material.createBasicTexture('../_textures/stone-wall.png')
  floorMat.specular = Colours.BLACK
  floorMat.shininess = 100
  const floor = ctx.createPlaneInstance(floorMat, 260, 260, 10, 10, 6)
  floor.position = [0, 0, 0]

  const mellonTx = Material.createBasicTexture('../_textures/mellon.jpg')
  const mellon = ctx.createSphereInstance(mellonTx, 4, 32, 16)
  mellonTx.diffuse = [0.7, 1.4, 0.7]
  mellonTx.specular = [1.0, 1.0, 1.0]
  mellonTx.shininess = 25
  mellon.position = [18, 21, -17]

  const crateMat = Material.createBasicTexture('../_textures/crate.png')
  crateMat.addSpecularTexture('../_textures/crate-specular.png')
  crateMat.shininess = 40
  crateMat.specular = [2.0, 2.0, 2.0]
  const cube = ctx.createCubeInstance(crateMat, 13)
  cube.rotateY(Math.PI / 4)
  cube.position = [-13, 6.5, -18]

  const tp = ctx.createModelInstance('teapot')
  const tpMat = Material.createSolidColour(1, 0.8, 0.1)
  tp.material = tpMat
  tpMat.shininess = 70
  tpMat.specular = [0.8, 0.8, 0.8]
  tp.scale = [1.7, 1.8, 1.7]
  tp.position = [22, 17.5, -8]
  tp.rotateYDeg(45)

  const ico = ctx.createModelInstance('icosahedron')
  const icoMat = Material.createSolidColour(0.6, 0.2, 0.2)
  icoMat.specular = [1.0, 1.0, 1.0]
  icoMat.ambient = [1.0, 1.0, 1.0]
  icoMat.shininess = 80
  ico.material = icoMat
  ico.position = [-6, 4.95, 12]
  ico.rotateXDeg(20)
  ico.scale = [6.5, 6.5, 6.5]

  const magMat = Material.createSolidColour(1.0, 0.0, 1.0)
  magMat.emissive = [1, 0.2, 0.8]
  magMat.diffuse = [0, 0, 0]
  const magentaBall = ctx.createSphereInstance(magMat, 3, 16, 8)
  magentaBall.position = [10, 12, 60]

  const bottle = ctx.createModelInstance('wine')
  bottle.position = [-14, 11, -14]
  bottle.rotateXDeg(-90)
  bottle.scale = [0.6, 0.6, 0.6]

  const matGlass = Material.createSolidColour(0.6, 0.6, 0.6)
  matGlass.specular = [1.0, 1.0, 1.0]
  matGlass.shininess = 100
  matGlass.opacity = 0.3
  const sphereWhite = ctx.createSphereInstance(matGlass, 3, 16, 8)
  sphereWhite.position = [12, 20.5, -8]

  const matBlue = Material.createSolidColour(0.2, 0.3, 1.0)
  matBlue.specular = [0.8, 0.8, 0.8]
  matBlue.shininess = 50
  matBlue.opacity = 0.5
  const cylinder = ctx.createCylinderInstance(matBlue, 2.3, 6, 16, 8)
  cylinder.position = [10, 20, -20]
}

// Camera
let camHeight = 40
ctx.camera.position = [0, camHeight, 30]
ctx.camera.lookAt = [0, 10, 0]
ctx.camera.far = 500

// Lights
ctx.globalLight.setAsPosition(4, 3, 1.5)
ctx.globalLight.colour = [0.7, 0.7, 0.7]
ctx.globalLight.ambient = [0.01, 0.01, 0.01]
ctx.createPointLight([-30, 19, -60], Colours.GREEN)
ctx.createPointLight([10, 30, 60], [0.9, 0.1, 0.4], 2.4)

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
