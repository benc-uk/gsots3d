import { Model, Context, setLogLevel, Material } from '../../dist-bundle/gsots3d.js'

setLogLevel('debug')

const ctx = await Context.init('canvas')

const tableMdl = await Model.parse('../objects', 'table.obj')
const chestMdl = await Model.parse('../objects', 'chest.obj')
const blockMdl = await Model.parse('../objects', 'floor.obj')
ctx.models.add(tableMdl)
ctx.models.add(chestMdl)
ctx.models.add(blockMdl)

const table = ctx.createModelInstance('table')
table.position = [5, 3, -4]
table.scale = [2.1, 1.3, 2.7]
table.rotateX(Math.PI / 2)

const chest1 = ctx.createModelInstance('chest')
chest1.position = [-10, 0, 0]

const chest2 = ctx.createModelInstance('chest')
chest2.position = [13, 0, 11]
chest2.rotateY(Math.PI / 1.5)

const floor = ctx.createModelInstance('floor')
floor.scale = [8, 1, 8]
floor.rotateX(Math.PI / 2)
floor.position = [0, -10, 0]

const sphereRed = ctx.createSphereInstance(Material.createDiffuse(0.8, 0.1, 0.1), 2, 32, 16)
sphereRed.position = [8, 7, -6]

const sphereGreen = ctx.createSphereInstance(Material.createDiffuse(0.1, 0.2, 0.9), 2, 32, 16)
sphereGreen.position = [14, 7, -8]

const texture = Material.createTexture('../textures/mellon.jpg')
const mellon = ctx.createSphereInstance(texture, 3, 32, 16)
texture.diffuse = [0.7, 1.4, 0.7]
mellon.position = [11, 8, -14]

// Camera
const camHeight = 30
ctx.camera.position = [11, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 300

// Static light
ctx.defaultLight.position = [-60, 42, -14]

let time = 0
const radius = 40
const speed = 1.9

// Update loop
ctx.update = (delta) => {
  time += delta

  const x = Math.cos(time / speed) * radius
  const z = Math.sin(time / speed) * radius
  ctx.camera.position = [x, camHeight, z]
}

ctx.debug = true
ctx.start()

// on lose focus
window.onblur = () => {
  ctx.stop()
}

// on focus
window.onfocus = () => {
  ctx.start()
}
