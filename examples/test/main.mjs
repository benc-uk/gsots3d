import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.camera.position = [37, 30, 76]
ctx.globalLight.setAsPosition(1, 1, 5)
ctx.globalLight.colour = Colours.BLACK
ctx.globalLight.ambient = [0.1, 0.1, 0.1]
ctx.camera.far = 5000

ctx.camera.enableFPControls(0, -0.2, 0.002, 0.7)

const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg', true, false)
wallMat.addNormalTexture('../_textures/brickwall_normal.jpg', true, false)
wallMat.specular = [0.9, 0.7, 0.4]
wallMat.shininess = 300

const wall = ctx.createPlaneInstance(wallMat, 200, 200, 12, 12, 6)
wall.rotateX(Math.PI / 2)
wall.position = [0, 0, -50]
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
const s = ctx.createModelInstance('Lowpoly_Notebook_2')
s.position = [58, 15, 35]
s.scale = [6.2, 6.2, 6.2]
const p = ctx.createModelInstance('potted_plant_obj')
p.position = [28, 0, 5]
p.scale = [0.8, 0.8, 0.8]

const light = ctx.createPointLight([0, 0, 0], Colours.WHITE, 3)

const ballMat = Material.createSolidColour(Colours.WHITE)
ballMat.emissive = [1, 1, 1]
ballMat.diffuse = [1, 1, 1]
ballMat.shininess = 100
const ball = ctx.createSphereInstance(ballMat, 0.5)
ball.position = light.position

ctx.update = () => {
  light.position[0] = ctx.camera.position[0] + 30
  light.position[1] = ctx.camera.position[1] + 10
  light.position[2] = ctx.camera.position[2] - 30
}

ctx.start()
