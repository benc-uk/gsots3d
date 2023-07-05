import { Model, Context, setLogLevel } from '../../browser/gsots3d.js'

setLogLevel('debug')

const ctx = await Context.init('canvas')

const tableMdl = await Model.parse('../objects', 'table.obj')
const chestMdl = await Model.parse('../objects', 'chest.obj')
const blockMdl = await Model.parse('../objects', 'floor.obj')
ctx.models.add(tableMdl)
ctx.models.add(chestMdl)
ctx.models.add(blockMdl)

const table = ctx.createInstance('table')
table.position = [5, 3, -4]
table.scale = [2.1, 1.3, 2.7]
table.rotateX(Math.PI / 2)

const chest1 = ctx.createInstance('chest')
chest1.position = [-10, 0, 0]

const chest2 = ctx.createInstance('chest')
chest2.position = [13, 0, 11]
chest2.rotateY(Math.PI / 1.5)

const floor = ctx.createInstance('floor')
floor.scale = [8, 1, 8]
floor.rotateX(Math.PI / 2)
floor.position = [0, -10, 0]

const camHeight = 30
ctx.camera.position = [11, camHeight, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 300

// Static light
ctx.defaultLight.position = [40, 22, 14]

let time = 0
const radius = 40
const speed = 1.9

ctx.update = (delta) => {
  time += delta

  const x = Math.cos(time / speed) * radius
  const z = Math.sin(time / speed) * radius
  ctx.camera.position = [x, camHeight, z]

  const xLook = Math.cos(time / speed + Math.PI) * radius
  ctx.camera.lookAt = [xLook, -5, 0]
  //ctx.defaultLight.position = [x, camHeight, z]
}

ctx.debug = true
ctx.start()
