import { Model, Context, setLogLevel, Material } from '../../dist-bundle/gsots3d.js'

setLogLevel('debug')

const ctx = await Context.init('canvas')

const tableMdl = await Model.parse('../objects', 'table.obj')
const chestMdl = await Model.parse('../objects', 'chest.obj')
const blockMdl = await Model.parse('../objects', 'block.obj')
ctx.models.add(tableMdl)
ctx.models.add(chestMdl)
ctx.models.add(blockMdl)

const table = ctx.createModelInstance('table')
table.position = [5, 2.5, -4]
table.scale = [2.1, 1.5, 2.7]
table.rotateX(Math.PI / 2)

const chest1 = ctx.createModelInstance('chest')
chest1.position = [-10, 0, 0]

const chest2 = ctx.createModelInstance('chest')
chest2.position = [13, 0, 11]
chest2.rotateY(Math.PI / 1.5)

const block = ctx.createModelInstance('block')
block.position = [-12, -6, 28]
block.scale = [0.5, 0.5, 0.5]
block.rotateY(1.2)

const floor = ctx.createPlaneInstance(Material.createTexture('../textures/stone-wall.png', false), 260, 260, 5, 5)
floor.position = [0, -8, 0]

const matRed = Material.createDiffuse(0.8, 0.1, 0.1)
matRed.specular = [1.0, 1.0, 1.0]
matRed.shininess = 100
const sphereRed = ctx.createSphereInstance(matRed, 2, 32, 16)
sphereRed.position = [8, 7, -6]

const matBlue = Material.createDiffuse(0.1, 0.1, 0.8)
matBlue.specular = [0.5, 0.5, 0.5]
matBlue.shininess = 20
const sphereBlue = ctx.createSphereInstance(matBlue, 2, 32, 16)
sphereBlue.position = [14, 7, -8]

const mellonTx = Material.createTexture('../textures/mellon.jpg')
const mellon = ctx.createSphereInstance(mellonTx, 3, 32, 16)
mellonTx.diffuse = [0.7, 1.4, 0.7]
mellonTx.specular = [1.0, 1.0, 1.0]
mellonTx.shininess = 25
mellon.position = [11, 8, -13]

const cube = ctx.createCubeInstance(Material.createTexture('../textures/STARG2.png'), 10)
cube.rotateY(Math.PI / 4)
cube.position = [-13, -2.5, -18]

// Camera
const camHeight = 30
ctx.camera.position = [11, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 300

// Static light
ctx.defaultLight.position = [-60, 42, -14]
ctx.ambientLight = [0.09, 0.09, 0.09]

let time = 0
const radius = 40
const speed = 3

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
