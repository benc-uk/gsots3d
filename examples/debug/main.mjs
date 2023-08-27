import { Context, Material, Node } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()

ctx.camera.position = [0, 80, 60]
ctx.camera.enableFPControls(0.0, 0.0, 0.0025, 5)
ctx.camera.far = 4000

ctx.globalLight.setAsPosition(9, 9, 9)
ctx.globalLight.ambient = [0.4, 0.4, 0.4]
ctx.globalLight.enableShadows({
  zoom: 800,
  mapSize: 4096,
})

const floorMat = Material.createSolidColour(0.2, 0.4, 0.0)
ctx.createPlaneInstance(floorMat, 2000, 2000)

const mat = Material.createSolidColour(Math.random(), Math.random(), Math.random())
mat.specular = [1, 1, 1]
mat.shininess = 20
const cyl = ctx.createCylinderInstance(mat, 10, 70, 32)
cyl.scale = [5.5, 1.5, 1.5]
const sphere = ctx.createSphereInstance(Material.RED, 10, 32)
sphere.position = [20, 30, 0]
const grp1 = new Node()
const grp2 = new Node()
grp1.position = [30, 0, -90]
grp1.addChild(cyl)

cyl.position = [60, 0, 0]

grp2.position = [0, 0, -190]
grp2.addChild(grp1)
grp2.addChild(sphere)
grp2.rotateZDeg(5)

// grp2.castShadow = false
// grp2.scale = [2.5, 2.5, 2.5]

ctx.update = () => {
  // rotate grp1 around the origin
  cyl.rotateYDeg(0.6)
  // rotate the global light at height 90 around the origin radius 100
  // ctx.globalLight.setAsPosition(100 * Math.cos(Stats.totalTime / 8), 90, 100 * Math.sin(Stats.totalTime / 8))
}
ctx.start()
