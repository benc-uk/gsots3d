import { Colours, Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
// window.addEventListener('resize', () => ctx.resize())
ctx.debug = true

ctx.camera.position = [0, 200, 700]
ctx.globalLight.setAsPosition(3, 1, 0)
ctx.camera.far = 5000

// ctx.camera.enableFPControls(0, -0.2, 0.002, 1.0)

const m = Material.createBasicTexture('../_textures/STARG2.png')
ctx.createPlaneInstance(m, 1000, 1000, 1, 1, 3)

const redLight = ctx.createPointLight([30, 100, 180], Colours.RED, 10)
ctx.createPointLight([180, 100, 190], Colours.YELLOW, 19)

const impMat = Material.createBasicTexture('../_textures/doom-imp.png')
impMat.diffuse = [1, 1, 1]
const imp = ctx.createBillboardInstance(impMat, 200, 200)
imp.position = [0, 100, 100]

let dirX = 1
let dirZ = 1
const angle = 0.47
ctx.update = (delta) => {
  // bounce the red light around the scene for some reason
  redLight.position[0] += delta * dirX * 700 * Math.sin(angle)
  redLight.position[2] += delta * dirZ * 700 * Math.cos(angle)
  if (redLight.position[0] > 500) dirX = -1
  if (redLight.position[0] < -500) dirX = 1
  if (redLight.position[2] > 500) dirZ = -1
  if (redLight.position[2] < -500) dirZ = 1
}

ctx.start()
