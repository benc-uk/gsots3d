import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
// window.addEventListener('resize', () => ctx.resize())
// ctx.debug = true

ctx.camera.position = [0, 20, 70]
ctx.globalLight.setAsPosition(1, 1, 5)
ctx.globalLight.colour = Colours.BLACK
ctx.globalLight.ambient = [0.3, 0.3, 0.3]
ctx.camera.far = 5000

ctx.camera.enableFPControls(0, -0.2, 0.002, 2.0)

const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg')
wallMat.addNormalTexture('../_textures/brickwall_normal.jpg')
wallMat.specular = [0.9, 0.7, 0.4]
wallMat.shininess = 300

const wall = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall.rotateX(Math.PI / 2)
wall.flipTextureY = true

const wall2 = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall2.rotateX(-Math.PI / 2)
wall2.flipTextureY = true
wall2.position = [0, 0, 100]

const floor = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
floor.rotateYDeg(90)
floor.flipTextureY = true

const m2 = Material.createBasicTexture('../_textures/brickwall.jpg')
const cube = ctx.createCubeInstance(m2, 20)
cube.position = [5, -5, 20]
const light = ctx.createPointLight([80, 50, 40], Colours.WHITE, 4)

const ballMat = Material.createSolidColour(Colours.WHITE)
ballMat.emissive = [1, 1, 1]
ballMat.diffuse = [1, 1, 1]
ballMat.shininess = 100
const ball = ctx.createSphereInstance(ballMat, 5)
ball.position = light.position

ctx.start()
