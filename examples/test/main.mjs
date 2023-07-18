import { Context, LightPoint, Material, RGB_BLACK } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 900, 500]
ctx.globalLight.setAsPosition(200, 1, 0)
ctx.globalLight.colour = RGB_BLACK
ctx.camera.far = 5000

const m = Material.WHITE //createBasicTexture('../../_textures/stone-wall.png')
m.specular = [0, 0, 0]

const _ = ctx.createPlaneInstance(m, 1000, 1000, 1, 1, 5)

const colortable = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
]

const maxlights = 2
for (let i = 0; i < maxlights; i++) {
  const light = new LightPoint()
  light.position = [0, 60, 200 + i * -500]
  light.colour = colortable[i % colortable.length]

  ctx.lights.push(light)
}

ctx.start()
