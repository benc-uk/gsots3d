import { Context, Material, Stats } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.start()

ctx.camera.position = [0, 20, 60]
ctx.camera.enableFPControls(0.0, 0.0, 0.0025, 5)
ctx.camera.far = 4000

ctx.globalLight.setAsPosition(9, 9, 9)
ctx.globalLight.ambient = [0.4, 0.4, 0.4]
ctx.globalLight.enableShadows({
  zoom: 800,
  mapSize: 4096,
})

const floorMat = Material.createSolidColour(0.2, 0.6, 0.0)
ctx.createPlaneInstance(floorMat, 2000, 2000)

const maxCyls = 300
for (let i = 0; i < maxCyls; i++) {
  const mat = Material.createSolidColour(Math.random(), Math.random(), Math.random())
  mat.specular = [1, 1, 1]
  mat.shininess = 20
  const cyl = ctx.createCylinderInstance(mat, 10, 70, 32)
  cyl.position = [Math.random() * 2000 - 1000, Math.random() * 50 - 15, Math.random() * 2000 - 1000]
}

ctx.update = () => {
  // rotate the global light at height 90 around the origin radius 100
  ctx.globalLight.setAsPosition(100 * Math.cos(Stats.totalTime / 8), 90, 100 * Math.sin(Stats.totalTime / 8))
}
