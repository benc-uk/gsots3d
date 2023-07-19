import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 1000, 800]
ctx.globalLight.setAsPosition(30, 1, 0)
ctx.camera.far = 5000

const m = Material.createBasicTexture('../_textures/stone-wall.png')
m.specular = [0, 0, 0]

ctx.createPlaneInstance(m, 1000, 1000, 1, 1, 5)

const colortable = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
]

const maxlights = 6
for (let i = 0; i < maxlights; i++) {
  ctx.createPointLight([0, 40, 400 - i * 150], colortable[i], 10)
}

ctx.start()
