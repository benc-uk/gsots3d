import { BillboardType, Context } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [10, 20, 20]
ctx.globalLight.setAsPosition(3, 1, 1)
ctx.globalLight.ambient = [0.15, 0.15, 0.15]
ctx.camera.far = 5000

ctx.createBillboardInstance('../_textures/doom-imp.png', 8, 8, BillboardType.SPHERICAL)

ctx.start()
