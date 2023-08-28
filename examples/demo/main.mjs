import { Context, Material, Colours } from '../../dist-bundle/gsots3d.js'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const ctx = await Context.init('canvas')
ctx.debug = false
ctx.setLogLevel('info')

// Tweaks for mobile
ctx.gamma = isMobile ? 1.5 : 1.0
const moveSpeed = isMobile ? 0.5 : 1.0

// Load models
try {
  await ctx.loadModel('../_objects', 'table.obj')
  await ctx.loadModel('../_objects/chest', 'chest.obj')
  await ctx.loadModel('../_objects/door', 'door.obj')
  await ctx.loadModel('../_objects', 'icosahedron.obj')
  await ctx.loadModel('../_objects', 'teapot.obj')
  await ctx.loadModel('../_objects', 'wine.obj')
} catch (e) {
  console.error(e)
}

let scifiCube

// Build scene
try {
  const door = ctx.createModelInstance('door')
  door.scale = [5, 5, 5]
  door.position = [130, 0, 50]
  door.rotateYDeg(-90)

  const door2 = ctx.createModelInstance('door')
  door2.scale = [5, 5, 5]
  door2.position = [-130, 0, -50]
  door2.rotateYDeg(-90)

  const door3 = ctx.createModelInstance('door')
  door3.scale = [5, 5, 5]
  door3.position = [0, 0, -130]

  const table = ctx.createModelInstance('table')
  table.position = [16, 0, -15]
  table.rotateXDeg(-90)
  table.rotateZDeg(-12)
  table.scale = [0.2, 0.3, 0.5]

  const chest1 = ctx.createModelInstance('chest')
  chest1.scale = [3.5, 3.5, 3.5]
  chest1.position = [-21, 0, 2]
  chest1.rotateYDeg(-10)

  const chest2 = ctx.createModelInstance('chest')
  chest2.scale = [3.5, 3.5, 3.5]
  chest2.position = [21, 0, 6]
  chest2.rotateYDeg(-90)

  const matGlass = Material.createSolidColour(0.6, 0.6, 0.6)
  matGlass.specular = [1.0, 1.0, 1.0]
  matGlass.shininess = 100
  matGlass.opacity = 0.3
  matGlass.reflectivity = 0.6
  const crystalBall = ctx.createSphereInstance(matGlass, 4, 24, 12)
  crystalBall.position = [12, 21, -8]

  const matBlueGlass = Material.createSolidColour(0.2, 0.3, 1.0)
  matBlueGlass.specular = [0.8, 0.8, 0.8]
  matBlueGlass.shininess = 50
  matBlueGlass.opacity = 0.25
  const cylinder = ctx.createCylinderInstance(matBlueGlass, 3, 12, 16, 8)
  cylinder.position = [10, 20, -20]

  const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
  ctx.createPlaneInstance(floorMat, 260, 260, 1, 1, 8)
  floorMat.diffuse = [0.7, 0.7, 1]

  const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg')
  wallMat.addNormalTexture('../_textures/brickwall_normal.jpg')
  wallMat.specular = [0.2, 0.2, 0.2]
  wallMat.reflectivity = 0.0

  const wall1 = ctx.createPlaneInstance(wallMat, 260, 260, 10, 10, 4)
  wall1.position = [0, 130, -130]
  wall1.rotateXDeg(90)
  wall1.castShadow = false

  const wall2 = ctx.createPlaneInstance(wallMat, 260, 260, 10, 10, 4)
  wall2.position = [0, 130, 130]
  wall2.rotateXDeg(-90)
  wall2.castShadow = false

  const wall3 = ctx.createPlaneInstance(wallMat, 260, 260, 10, 10, 4)
  wall3.position = [130, 130, 0]
  wall3.rotateZDeg(90)
  wall3.rotateYDeg(90)
  wall3.castShadow = false

  const wall4 = ctx.createPlaneInstance(wallMat, 260, 260, 10, 10, 4)
  wall4.position = [-130, 130, 0]
  wall4.rotateZDeg(-90)
  wall4.rotateYDeg(90)
  wall4.castShadow = false

  const impMat = Material.createBasicTexture('../_textures/doom-imp.png')
  const doomImp = ctx.createBillboardInstance(impMat, 30)
  doomImp.scale = [0.8, 0.8, 0.8]
  doomImp.position = [-6, 0, -5]

  const mellonTx = Material.createBasicTexture('../_textures/mellon.jpg')
  const mellon = ctx.createSphereInstance(mellonTx, 4, 24, 12)
  mellonTx.diffuse = [0.7, 1.4, 0.7]
  mellonTx.specular = [1.0, 1.0, 1.0]
  mellonTx.shininess = 25
  mellon.position = [22, 21.5, -19]

  const crateMat = Material.createBasicTexture('../_textures/crate.png')
  crateMat.addSpecularTexture('../_textures/crate-specular.png')
  crateMat.shininess = 40
  crateMat.specular = [2.0, 2.0, 2.0]
  const cube = ctx.createCubeInstance(crateMat, 13)
  cube.rotateY(Math.PI / 4)
  cube.position = [-13, 6.5, -18]

  const tpMat = Material.createSolidColour(1, 0.8, 0.1)
  tpMat.shininess = 70
  tpMat.specular = [0.8, 0.8, 0.8]
  tpMat.reflectivity = 0.6
  const tp = ctx.createModelInstance('teapot')
  tp.scale = [1.7, 1.8, 1.7]
  tp.position = [22, 17.5, -8]
  tp.rotateYDeg(45)
  tp.material = tpMat

  const ico = ctx.createModelInstance('icosahedron')
  const icoMat = Material.createSolidColour(0.6, 0.2, 0.2)
  icoMat.specular = [1.0, 1.0, 1.0]
  icoMat.ambient = [1.0, 1.0, 1.0]
  icoMat.shininess = 80
  icoMat.reflectivity = 0.2
  ico.material = icoMat
  ico.position = [-6, 4.95, 12]
  ico.rotateXDeg(20)
  ico.scale = [6.5, 6.5, 6.5]

  const bottle = ctx.createModelInstance('wine')
  bottle.position = [-14, 13, -14]
  bottle.rotateXDeg(-90)
  bottle.scale = [0.6, 0.6, 0.6]

  const scifi = Material.createBasicTexture('../_textures/sci-fi.png')
  scifi.addNormalTexture('../_textures/sci-fi_normal.png')
  scifi.diffuse = [0.5, 0.5, 0.8]
  scifi.specular = [2, 2, 2]
  scifi.shininess = 30
  scifiCube = ctx.createCubeInstance(scifi, 12)
  scifiCube.position = [10, 16, 21]
  scifiCube.rotateYDeg(28)
} catch (e) {
  console.error(e)
}

// Camera
ctx.camera.position = [0, 25, 50]
ctx.camera.lookAt = [0, 10, 0]
ctx.camera.far = 500
ctx.camera.enableFPControls(0, -0.2, 0.002, moveSpeed)

// Main light
const lightPos = [5, 10, 2]
ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
ctx.globalLight.colour = [0.8, 0.8, 0.8]
ctx.globalLight.ambient = [0.05, 0.05, 0.05]
// Point lights
const lightGreen = ctx.createPointLight([-59, 19, -60], Colours.GREEN)
const lightPink = ctx.createPointLight([10, 30, 60], [0.9, 0.1, 0.4], 2.4)

// Controls
window.addEventListener('keydown', (e) => {
  // change height
  if (e.key === 'q') {
    let h = ctx.camera.position[1]
    h = Math.min(h + 1.5, 200)
    ctx.camera.position[1] = h
  }

  if (e.key === 'e') {
    let h = ctx.camera.position[1]
    h = Math.max(h - 1.5, 1)
    ctx.camera.position[1] = h
  }

  // debug
  if (e.key === '0') {
    ctx.debug = !ctx.debug
  }

  if (e.key === '9') {
    if (ctx.camera.fpModeEnabled) {
      ctx.camera.disableFPControls()
    } else {
      ctx.camera.enableFPControls(0, -0.2, 0.002, 2.0)
    }
  }

  // fov
  if (e.key === 'f') {
    ctx.camera.fov = Math.max(ctx.camera.fov - 1, 1)
  }

  if (e.key === 'g') {
    ctx.camera.fov = Math.min(ctx.camera.fov + 1, 120)
  }

  // lights
  if (e.key === '2') {
    lightPink.enabled = !lightPink.enabled
  }
  if (e.key === '1') {
    lightGreen.enabled = !lightGreen.enabled
  }
  if (e.key === '3') {
    ctx.globalLight.enabled = !ctx.globalLight.enabled
  }
  if (e.key === '4') {
    lightPos[0] -= 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }
  if (e.key === '5') {
    lightPos[0] += 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }
})

// Update loop
ctx.update = (delta) => {
  scifiCube.rotateYDeg(delta * 25)
}

// Dynamic reflections, big performance hit
ctx.setDynamicEnvmap([0, 15, 0], 256)

// Shadows
ctx.globalLight.enableShadows({
  mapSize: 2048,
  zoom: 100,
  polygonOffset: 1,
})

ctx.start()
