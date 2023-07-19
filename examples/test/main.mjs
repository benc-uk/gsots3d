import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true
// ctx.setRenderMode('flat')

ctx.camera.position = [0, 1000, 800]
ctx.globalLight.setAsPosition(8, 1, 0)
ctx.camera.far = 5000

const m = Material.createBasicTexture('../_textures/stone-wall.png')
m.specular = [0, 0, 0]

ctx.createPlaneInstance(m, 1000, 1000, 16, 16, 5)

const colortable = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
]

const maxlights = 1
for (let i = 0; i < maxlights; i++) {
  ctx.createPointLight([0, 40, 400 - i * 150], colortable[i], 10)
}

const m2 = Material.createSolidColour(1, 1, 1)
m2.emissive = [0, 1, 0]
// m2.specular = [1, 1, 1]
m2.diffuse = [0, 0, 0]
ctx.createSphereInstance(m2, 50)

ctx.createPointLight([0, 60, 0], Colours.GREEN, 10)

ctx.start()
