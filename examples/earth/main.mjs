import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()

ctx.camera.position = [0, 6, 20]
ctx.camera.far = 1000
ctx.globalLight.ambient = [0.01, 0.01, 0.1]
ctx.globalLight.colour = [1.0, 0.9, 0.7]

const mat = Material.createBasicTexture('../_textures/earth.jpg', true)
mat.specular = [0.7, 0.7, 0.7]
mat.shininess = 50

// The earth!
ctx.createSphereInstance(mat, 7, 48, 32)

// Add stars
const starMat = Material.createSolidColour(1, 1, 1)
starMat.emissive = [1, 1, 1]
starMat.diffuse = [0, 0, 0]

const starRadius = 80
for (let i = 0; i < 400; i++) {
  const star = ctx.createSphereInstance(starMat, 0.1, 4, 4)
  star.position = [
    Math.random() * starRadius * 2 - starRadius,
    Math.random() * starRadius * 2 - starRadius,
    Math.random() * starRadius * 2 - starRadius,
  ]
}

let t = 0

let sunX = 0
const sunY = -40
let sunZ = 0
const sunR = 300

let cameraAngle = 0
const cameraSpeed = 0.1
const cameraRadius = 20

ctx.update = (delta) => {
  t += delta

  cameraAngle += delta * cameraSpeed
  ctx.camera.position = [cameraRadius * Math.sin(cameraAngle), 6, cameraRadius * Math.cos(cameraAngle)]

  sunX = sunR * Math.sin(t * -0.07)
  sunZ = sunR * Math.cos(t * -0.07)
  ctx.globalLight.setAsPosition(sunX, sunY, sunZ)
}

ctx.start()
