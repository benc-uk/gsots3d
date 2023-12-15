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

const matBlue = Material.BLACK
matBlue.shininess = 200
matBlue.reflectivity = 1.1

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

// Add a skybox as environment
ctx.setEnvmap(
  true,
  '../_textures/skybox-1/right.jpg',
  '../_textures/skybox-1/left.jpg',
  '../_textures/skybox-1/top.jpg',
  '../_textures/skybox-1/bottom.jpg',
  '../_textures/skybox-1/front.jpg',
  '../_textures/skybox-1/back.jpg',
)

ctx.update = () => {
  teapot.rotateY(0.015)
  teapot2.rotateY(-0.015)
  teapot3.rotateY(0.01)
}

ctx.start()
