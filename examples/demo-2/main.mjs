import { Colours, Context, Material } from '../../dist-single/gsots3d.js'
import { isMobile } from '../screen.mjs'

const ctx = await Context.init()
ctx.debug = false

// Tweaks for mobile
ctx.gamma = isMobile() ? 1.2 : 1.0
const moveSpeed = isMobile() ? 0.8 : 1.2

ctx.camera.position = [37, 40, 76]
ctx.globalLight.setAsPosition(-0.5, 1, 0)
ctx.globalLight.colour = Colours.WHITE
ctx.globalLight.ambient = [0.2, 0.2, 0.2]
ctx.camera.far = 500
ctx.globalLight.enableShadows({
  mapSize: 2048,
  zoom: 150,
})

ctx.camera.enableFPControls(0, -0.2, 0.002, moveSpeed)

const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg')
wallMat.addNormalTexture('../_textures/brickwall_normal.jpg')
wallMat.specular = [0.9, 0.7, 0.4]
wallMat.shininess = 300

const wall = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall.rotateXDeg(90)
wall.position = [3, -30, -100]

ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)

const cubeMat = Material.createBasicTexture('../_textures/sci-fi.png')
cubeMat.addNormalTexture('../_textures/sci-fi_normal.png')
cubeMat.diffuse = [0.4, 0.4, 0.6]
cubeMat.specular = [0.7, 0.7, 0.7]
cubeMat.shininess = 50
cubeMat.reflectivity = 0.5
const crateMat = Material.createBasicTexture('../_textures/crate.png')
crateMat.addSpecularTexture('../_textures/crate-specular.png')
crateMat.specular = [1, 1, 1]
const cube = ctx.createCubeInstance(crateMat, 20)
cube.position = [-15, 10, 35]
cube.rotateYDeg(33)

const cube2 = ctx.createCubeInstance(cubeMat, 14)
cube2.position = [44, 27, 3]
cube2.rotateYDeg(77)

await ctx.loadModel('../_objects/laptop', 'Lowpoly_Notebook_2.obj')
await ctx.loadModel('../_objects/plant', 'potted_plant_obj.obj')
await ctx.loadModel('../_objects', 'teapot.obj')

const laptop = ctx.createModelInstance('Lowpoly_Notebook_2')
laptop.position = [78, 1, 35]
laptop.scale = [12.2, 12.2, 12.2]

const teapot = ctx.createModelInstance('teapot')
teapot.position = [-15, 20, 35]
teapot.scale = [6, 6, 6]
const teapotMaterial = Material.createSolidColour(0.7, 0.7, 1.0)
teapotMaterial.specular = [0.7, 0.7, 0.7]
teapotMaterial.shininess = 50
teapotMaterial.reflectivity = 0.5
teapot.material = teapotMaterial

// Place plants at each corner of the room
const p1 = ctx.createModelInstance('potted_plant_obj')
p1.position = [-80, 0, 80]
const p2 = ctx.createModelInstance('potted_plant_obj')
p2.position = [-80, 0, -80]
const p3 = ctx.createModelInstance('potted_plant_obj')
p3.position = [80, 0, -80]
const p4 = ctx.createModelInstance('potted_plant_obj')
p4.position = [80, 0, 80]

const mirrorMat = Material.createSolidColour(0.3, 0.6, 0.3)
mirrorMat.reflectivity = 0.7
mirrorMat.shininess = 100
mirrorMat.specular = [1, 1, 1]
const mirrorBall = ctx.createSphereInstance(mirrorMat, 20, 24, 24)
mirrorBall.position = [-25, 25, -35]
mirrorBall.metadata.special = 1

// Red ball
const redBallMat = Material.createSolidColour(0.8, 0.2, 0.1)
redBallMat.specular = [0.7, 0.7, 0.7]
redBallMat.shininess = 50
redBallMat.reflectivity = 0.5
const redBall = ctx.createSphereInstance(redBallMat, 8, 32, 32)
redBall.position = [25, 8, 20]
let redBallDir = 1

// Lights that follows the camera
const light = ctx.createPointLight([0, 0, 0], Colours.WHITE, 3)

ctx.update = () => {
  light.position[0] = ctx.camera.position[0] - 40
  light.position[1] = ctx.camera.position[1] + 10
  light.position[2] = ctx.camera.position[2] - 40

  teapot.rotateYDeg(0.6)
  cube2.rotateYDeg(-0.4)

  if (redBall.position[2] > 80) {
    redBallDir = -1
  }
  if (redBall.position[2] < -80) {
    redBallDir = 1
  }
  redBall.position[2] += redBallDir * 0.65
  redBall.position[0] += redBallDir * 0.25
}

ctx.setEnvmap(
  true,
  '../_textures/skybox-2/posx.png',
  '../_textures/skybox-2/negx.png',
  '../_textures/skybox-2/posy.png',
  '../_textures/skybox-2/negy.png',
  '../_textures/skybox-2/posz.png',
  '../_textures/skybox-2/negz.png'
)

ctx.setDynamicEnvmap([-25, 20, -35], 512, 400)

ctx.start()
