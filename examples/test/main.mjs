import { Context, Model } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.camera.position = [0, 4, 50]
ctx.globalLight.setAsPosition(3, 2, 1)
ctx.globalLight.ambient = [0.15, 0.15, 0.15]
ctx.camera.far = 10000

ctx.models.add(await Model.parse('../_objects', 'treasure_chest.obj'))

const model = ctx.createModelInstance('treasure_chest')
model.scale = [2.6, 2.6, 2.6]
model.position = [0, -5, 0]
// model.material = Material.RED
model.rotateXDeg(-90)

ctx.update = () => {
  model.rotateZDeg(0.4)
}
ctx.start()
