import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 7, 20]
ctx.globalLight.setAsPosition(18, 20, 25)
ctx.globalLight.ambient = [0.1, 0.1, 0.1]

const matBlue = Material.BLUE
matBlue.specular = [1.0, 1.0, 1.0]
matBlue.shininess = 100
matBlue.diffuse = [0.1, 0.26, 0.9]

await ctx.loadModel('../_objects', 'teapot.obj')
// await ctx.loadModel('../_objects', 'teapot.obj')

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

ctx.update = () => {
  teapot.rotateY(0.015)
  teapot2.rotateY(-0.015)
  teapot3.rotateY(0.01)
}

ctx.start()
