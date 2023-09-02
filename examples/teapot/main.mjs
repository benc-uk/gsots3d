import { Context, Material } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.camera.position = [0, 7, 20]
ctx.camera.enableFPControls(0, -0.3)
ctx.camera.far = 1000

ctx.globalLight.setAsPosition(18, 20, 25)
ctx.globalLight.ambient = [0.1, 0.1, 0.1]
ctx.globalLight.enableShadows({
  zoom: 20,
  mapSize: 2048,
})

const matBlue = Material.BLUE
matBlue.specular = [1.0, 1.0, 1.0]
matBlue.shininess = 100
matBlue.diffuse = [0.1, 0.26, 0.9]

await ctx.loadModel('../_objects', 'teapot.obj')

const teapot = ctx.createModelInstance('teapot')
teapot.scale = [2.5, 2.5, 2.5]
teapot.position = [0, -1, 0]
teapot.material = matBlue

const matRed = Material.RED
matRed.specular = [1.0, 1.0, 1.0]
matRed.shininess = 80

const matGreen = Material.GREEN
matGreen.specular = [1.0, 1.0, 1.0]
matGreen.diffuse = [0.2, 0.7, 0.15]
matGreen.shininess = 80

const teapot2 = ctx.createModelInstance('teapot')
teapot2.position = [6, -7, 0]
teapot2.material = matRed

const teapot3 = ctx.createModelInstance('teapot')
teapot3.position = [-6, -7, 0]
teapot3.material = matGreen

teapot.rotateY(-2.715)
teapot3.rotateY(-0.615)

// Add map
// ctx.setEnvmap(
//   true,
//   '../_textures/skybox-1/right.jpg',
//   '../_textures/skybox-1/left.jpg',
//   '../_textures/skybox-1/top.jpg',
//   '../_textures/skybox-1/bottom.jpg',
//   '../_textures/skybox-1/front.jpg',
//   '../_textures/skybox-1/back.jpg',
// )

const s1 = ctx.createSphereInstance(Material.RED, 15, 32, 32)
const s2 = ctx.createSphereInstance(Material.RED, 15, 32, 32)
const s3 = ctx.createSphereInstance(Material.RED, 15, 32, 32)
const s4 = ctx.createSphereInstance(Material.RED, 15, 32, 32)
const s5 = ctx.createSphereInstance(Material.WHITE, 15, 32, 32)

ctx.update = () => {
  teapot.rotateY(0.015)
  teapot2.rotateY(-0.015)
  teapot3.rotateY(0.01)
  const corners = ctx.camera.getFrustumCornersWorld()
  s1.position = corners.farBottomLeftWorld
  s2.position = corners.farBottomRightWorld
  s3.position = corners.farTopLeftWorld
  s4.position = corners.farTopRightWorld
  s5.position = corners.farCenter
}

ctx.start()
