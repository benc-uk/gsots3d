import { Context, Material, TextureCache } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true
const lightPos = [15, 20, 8]
ctx.camera.position = [0, 130, 200]
ctx.camera.enableFPControls(0, -0.65, 0.002, 4)
ctx.camera.far = 1800
ctx.gamma = 1.0

ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
const amb = 0.1
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows()

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
ctx.createPlaneInstance(floorMat, 1000, 1000, 1, 1, 6)

const pipeMat = Material.createBasicTexture('../_textures/sci-fi.png')
pipeMat.addNormalTexture('../_textures/sci-fi_normal.png')
const pipe = ctx.createCylinderInstance(pipeMat, 8, 80, 16, 1, false)
pipe.position = [0, 40, 0]
const pipe2 = ctx.createCylinderInstance(pipeMat, 3, 80, 16, 1, false)
pipe2.position = [80, 40, -40]

const r = ctx.createParticleSystem(4000, 5)
r.instance.position = [0, 75, 0]
const tex = TextureCache.instance.getCreate('../_textures/particles/flare.png')
const tex2 = TextureCache.instance.getCreate('../_textures/particles/fire.png')
r.particles.texture = tex
r.particles.maxLifetime = 4.5
r.particles.minLifetime = 1.5
r.particles.emitRate = 4000
r.particles.gravity = [0, -40, 0]
r.particles.ageColourRed = 3.0
r.particles.ageColourGreen = 1.7
r.particles.ageColourAlpha = 0.5
const spread = 1.2
r.particles.direction1 = [-spread, 2, -spread]
r.particles.direction2 = [spread, 2, spread]
r.particles.maxPower = 15
r.particles.minPower = 10
r.particles.timeScale = 3.0

const r2 = ctx.createParticleSystem(2000, 5)
r2.instance.position = [80, 80, -40]
r2.particles.texture = tex2
r2.particles.emitRate = 1000
r2.particles.maxPower = 10
r2.particles.minPower = 2
r2.particles.timeScale = 2.0
r2.particles.maxLifetime = 6
r2.particles.gravity = [0, 0, 0]
const spread2 = 0.5
r2.particles.direction1 = [-spread2, 2, -spread2]
r2.particles.direction2 = [spread2, 2, spread2]
r2.particles.ageColourGreen = 2.0
r2.particles.ageColourBlue = 3.0

// document.getElementById('emitRange').addEventListener('input', (e) => {
//   r.particles.emitRate = e.target.value
// })

// document.getElementById('maxLifetime').addEventListener('input', (e) => {
//   r.particles.maxLifetime = e.target.value / 100
// })

// document.getElementById('minLifetime').addEventListener('input', (e) => {
//   r.particles.minLifetime = e.target.value / 100
// })
// document.getElementById('grav').addEventListener('input', (e) => {
//   r.particles.gravity = [0, -e.target.value, 0]
// })

ctx.start()
