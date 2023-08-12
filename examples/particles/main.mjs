import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true
const lightPos = [15, 20, 8]
ctx.camera.position = [0, 180, 200]
ctx.camera.enableFPControls(0, -0.65, 0.002, 4)
ctx.camera.far = 1800
ctx.gamma = 1.0

ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
const amb = 0.1
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows()

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
ctx.createPlaneInstance(floorMat, 1000, 1000, 1, 1, 6)

const pipeMat = Material.createBasicTexture('../_textures/sci-fi.png')
pipeMat.addNormalTexture('../_textures/sci-fi_normal.png')
const pipe = ctx.createCylinderInstance(pipeMat, 3, 50, 16, 1, false)
pipe.position = [0, 25, 0]

const particles = ctx.createParticlesInstance(20000, 60, 1.5)
particles.position = [0, 50, 0]

ctx.start()
