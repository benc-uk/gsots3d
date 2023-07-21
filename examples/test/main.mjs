import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
// window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 200, 700]
ctx.globalLight.setAsPosition(3, 1, 0)
ctx.camera.far = 5000

ctx.camera.enableFPSControls()

const m = Material.createBasicTexture('../_textures/stone-wall.png')
m.specular = [0, 0, 0]

ctx.createPlaneInstance(m, 1000, 1000, 16, 16, 5)

ctx.createPointLight([-100, 100, 180], Colours.RED, 10)
ctx.createPointLight([100, 100, 180], Colours.YELLOW, 10)
const impMat = Material.createBasicTexture('../_textures/doom-imp.png')
impMat.diffuse = [1, 1, 1]

const imp = ctx.createBillboardInstance(impMat, 200, 200)

imp.position = [0, 100, 100]

ctx.start()
