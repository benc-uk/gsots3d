import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
// ctx.debug = true

ctx.camera.position = [37, 40, 76]
ctx.globalLight.setAsPosition(-0.5, 1, 0)
ctx.globalLight.colour = Colours.BLACK
ctx.globalLight.ambient = [0.2, 0.2, 0.2]
ctx.camera.far = 500

ctx.camera.enableFPControls(0, -0.2, 0.002, 0.7)

const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg', true, false)
wallMat.addNormalTexture('../_textures/brickwall_normal.jpg', true, false)
wallMat.specular = [0.9, 0.7, 0.4]
wallMat.shininess = 300

const wall = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall.rotateX(Math.PI / 2)
wall.position = [0, 0, -100]
wall.flipTextureX = true

const wall2 = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall2.rotateX(-Math.PI / 2)
wall2.position = [0, 0, 100]
wall2.flipTextureX = true

const floor = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
floor.flipTextureX = false
floor.flipTextureY = true

const cubeMat = Material.createBasicTexture('../_textures/sci-fi.png', true, false)
cubeMat.addNormalTexture('../_textures/sci-fi_normal.png', true, false)
cubeMat.diffuse = [0.4, 0.4, 0.6]
cubeMat.specular = [0.7, 0.7, 0.7]
cubeMat.shininess = 50
cubeMat.reflectivity = 0.5
const cube = ctx.createCubeInstance(cubeMat, 20)
cube.position = [-15, 10, 35]
cube.rotateYDeg(33)
cube.flipTextureX = true

const cube2 = ctx.createCubeInstance(cubeMat, 14)
cube2.position = [54, 7, 35]
cube2.rotateYDeg(77)
cube2.flipTextureX = true

await ctx.loadModel('../_objects/laptop', 'Lowpoly_Notebook_2.obj')
await ctx.loadModel('../_objects/plant', 'potted_plant_obj.obj')
await ctx.loadModel('../_objects', 'teapot.obj')
const laptop = ctx.createModelInstance('Lowpoly_Notebook_2')
laptop.position = [58, 15, 35]
laptop.scale = [6.2, 6.2, 6.2]

const teapot = ctx.createModelInstance('teapot')
teapot.position = [-15, 20, 35]
teapot.scale = [6, 6, 6]
const teapotMaterial = Material.createSolidColour(0.3, 0.3, 0.3)
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
const ball = ctx.createSphereInstance(mirrorMat, 20, 24, 24)
ball.position = [37, 20, 2]

const light = ctx.createPointLight([0, 0, 0], Colours.WHITE, 3)
const lightBallMat = Material.createSolidColour(Colours.WHITE)
lightBallMat.emissive = [1, 1, 1]
lightBallMat.diffuse = [1, 1, 1]
lightBallMat.shininess = 100
const lightBall = ctx.createSphereInstance(lightBallMat, 0.5)

ctx.update = () => {
  light.position[0] = ctx.camera.position[0] + 40
  light.position[1] = ctx.camera.position[1] + 10
  light.position[2] = ctx.camera.position[2] + 40
  lightBall.position = light.position
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

ctx.start()
