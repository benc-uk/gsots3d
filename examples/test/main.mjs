import { Context, Model } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.camera.position = [0, 4, 200]
ctx.globalLight.setAsPosition(3, 2, 1)
ctx.globalLight.ambient = [0.15, 0.15, 0.15]
ctx.camera.far = 10000

ctx.models.add(await Model.parse('../_objects', 'treasure_chest.obj'))

const model = ctx.createModelInstance('treasure_chest')
model.scale = [1, 1, 2]
model.rotateXDeg(-90)
model.position = [4, 0, 0]

ctx.start()
