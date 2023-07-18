import { Context, LightPoint, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 60, 80]
ctx.globalLight.setAsPosition(0, 10, 0)
ctx.globalLight.ambient = [0, 0, 0]
ctx.globalLight.diffuse = [1, 1, 1]
ctx.camera.far = 5000

const m = Material.createSolidColour(0.2, 0.2, 0.2)

const floor = ctx.createPlaneInstance(m, 50, 500)

const colortable = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
]

const maxlights = 9
for (let i = 0; i < maxlights; i++) {
  const light = new LightPoint()
  light.position = [0, 1, -95 + i * 15]
  light.colour = colortable[i % colortable.length]

  ctx.lights.push(light)
}

ctx.start()
