import { Model, Context, setLogLevel } from '../../browser/gsots3d.js'

setLogLevel('debug')

const ctx = await Context.init('canvas')

const tableMdl = await Model.parse('../objects', 'table.obj')
const chestMdl = await Model.parse('../objects', 'chest.obj')
const blockMdl = await Model.parse('../objects', 'block.obj')
ctx.models.add(tableMdl)
ctx.models.add(chestMdl)
ctx.models.add(blockMdl)

const c1 = ctx.createInstance('table')
c1.position = [5, 3, 0]
c1.scale = [2.1, 1.3, 2.7]
c1.rotateX(Math.PI / 2)

const c2 = ctx.createInstance('chest')
c2.position = [-10, 0, 0]

const floor = ctx.createInstance('block')
floor.scale = [10, 1, 10]
floor.rotateX(Math.PI / 2)
floor.position = [0, -10, 0]

ctx.camera.position = [11, 24, 30]
ctx.camera.lookAt = [0, 0, 0]
ctx.camera.far = 345

let time = 0
const radius = 40
const speed = 1.9

ctx.update = (delta) => {
  time += delta

  const x = Math.cos(time / speed) * radius
  const z = Math.sin(time / speed) * radius
  ctx.camera.position = [x, 24, z]
  ctx.defaultLight.position = [x, 20, z]
}

ctx.debug = true
ctx.start()
