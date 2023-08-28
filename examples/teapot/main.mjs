import { Context, Material, Camera } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 7, 20]
ctx.camera.enableFPControls(0, -0.3)
ctx.camera.far = 200

ctx.globalLight.setAsPosition(18, 20, 25)
ctx.globalLight.ambient = [0.1, 0.1, 0.1]

const topCam = new Camera()
topCam.position = [1, 30, 0]
ctx.addCamera('top', topCam)

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
ctx.setEnvmap(
  true,
  '../_textures/skybox-1/right.jpg',
  '../_textures/skybox-1/left.jpg',
  '../_textures/skybox-1/top.jpg',
  '../_textures/skybox-1/bottom.jpg',
  '../_textures/skybox-1/front.jpg',
  '../_textures/skybox-1/back.jpg'
)

ctx.update = () => {
  teapot.rotateY(0.015)
  teapot2.rotateY(-0.015)
  teapot3.rotateY(0.01)
}

window.addEventListener('keydown', (e) => {
  if (e.key === '1') {
    ctx.setActiveCamera('top')
  } else if (e.key === '2') {
    ctx.setActiveCamera('default')
  }

  if (e.key === '3') {
    ctx.removeSkybox()
  }
})

ctx.start()
