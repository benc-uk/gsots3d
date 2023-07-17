import { BillboardType, Context, Material, Model } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.camera.position = [10, 20, 20]
ctx.globalLight.setAsPosition(3, 1, 1)
ctx.globalLight.ambient = [0.15, 0.15, 0.15]
ctx.camera.far = 5000

const model = ctx.createBillboardInstance('../../_textures/doom-imp.png', 8, 8, BillboardType.SPHERICAL)

ctx.start()
