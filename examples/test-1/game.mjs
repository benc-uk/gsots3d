import { Model, Context, setLogLevel } from '../../dist-bundle/gsots3d.js'

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

const sphereRed = ctx.createSphereInstance(2)
sphereRed.position = [8, 7, -6]
sphereRed.renderable.material.diffuse = [1, 0, 0]

const sphereBlue = ctx.createSphereInstance(2)
sphereBlue.position = [14, 7, -8]
sphereBlue.renderable.material.diffuse = [0.2, 0.4, 1]

const sphereGreen = ctx.createSphereInstance(2)
sphereGreen.position = [11, 7, -12]
sphereGreen.renderable.material.diffuse = [0.2, 0.9, 0.2]

const camHeight = 30
ctx.camera.position = [11, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 300

// Static light
ctx.defaultLight.position = [-60, 82, -14]

let time = 0
const radius = 40
const speed = 1.9

ctx.update = (delta) => {
  time += delta

  const x = Math.cos(time / speed) * radius
  const z = Math.sin(time / speed) * radius
  ctx.camera.position = [x, camHeight, z]
}

ctx.debug = true
ctx.start()
