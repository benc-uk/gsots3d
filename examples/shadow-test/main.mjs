import { Context, Material } from '../../dist-bundle/gsots3d.js'

window.addEventListener('resize', () => ctx.resize())

const ctx = await Context.init()

const lightPos = [15, 20, 8]
ctx.camera.position = [0, 80, 100]
ctx.camera.enableFPControls(0, -0.35, 0.002, 3)
ctx.camera.far = 1800
ctx.gamma = 1.0

ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
const amb = 0.1
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  mapSize: 1024,
  zoom: 50,
})

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
ctx.createPlaneInstance(floorMat, 1000, 1000, 1, 1, 6)

const crateMat = Material.createBasicTexture('../_textures/crate.png')
crateMat.addSpecularTexture('../_textures/crate-specular.png')
crateMat.specular = [1.0, 1.0, 1.0]
crateMat.shininess = 80

const crate1 = ctx.createCubeInstance(crateMat, 30)
crate1.position = [0, 15, 0]
crate1.rotateYDeg(27)

const crate2 = ctx.createCubeInstance(crateMat, 20)
crate2.position = [40, 50, 10]
crate2.rotateYDeg(-36)

const sphereMat = Material.createBasicTexture('../_textures/earth.jpg')
const sphere = ctx.createSphereInstance(sphereMat, 18, 32, 32)
sphere.position = [40, 18, 20]

window.addEventListener('keydown', (e) => {
  // Move light
  if (e.key === '1') {
    lightPos[0] -= 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }
  if (e.key === '2') {
    lightPos[0] += 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }

  if (e.key === '3') {
    lightPos[2] -= 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }
  if (e.key === '4') {
    lightPos[2] += 1
    ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
  }
})

ctx.update = () => {
  crate2.rotateYDeg(0.5)
}

ctx.start()
