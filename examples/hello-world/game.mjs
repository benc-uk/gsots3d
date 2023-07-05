import { Model, Context } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()

ctx.models.add(await Model.parse('../objects', 'table.obj'))
ctx.createInstance('table')

ctx.start()
