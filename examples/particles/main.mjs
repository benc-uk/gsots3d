import { Context, Material, TextureCache, setLogLevel } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.camera.position = [0, 130, 150]
ctx.camera.enableFPControls(0, -0.24, 0.002, 4)
ctx.camera.far = 1800
ctx.gamma = 1.1
setLogLevel(1)

ctx.globalLight.setAsPosition(5, 20, 12)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  mapSize: 1024,
  // scatter: 0.4,
  zoom: 180.0,
  polygonOffsetFactor: 2.5,
})

ctx.setEnvmap(
  true,
  '../_textures/skybox-dungeon/right.png',
  '../_textures/skybox-dungeon/left.png',
  '../_textures/skybox-dungeon/up.png',
  '../_textures/skybox-dungeon/down.png',
  '../_textures/skybox-dungeon/front.png',
  '../_textures/skybox-dungeon/back.png'
)

await ctx.loadModel('../_objects/box', 'box.obj')

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
const f = ctx.createPlaneInstance(floorMat, 1000, 1000, 1, 1, 6)
f.receiveShadow = true

const pipeMat = Material.createBasicTexture('../_textures/sci-fi.png')
pipeMat.addNormalTexture('../_textures/sci-fi_normal.png')
const pipe = ctx.createCylinderInstance(pipeMat, 8, 80, 16, 1, false)
pipe.position = [-20, 40, 20]
const pipe2 = ctx.createCylinderInstance(pipeMat, 3, 80, 16, 1, false)
pipe2.position = [80, 40, -40]
const pipe3 = ctx.createCylinderInstance(pipeMat, 3, 30, 16, 1, false)
pipe3.position = [80, 80, -40]
pipe3.rotateZDeg(90)
pipe3.postTranslate = [0, -15, 0]

const sph = ctx.createSphereInstance(pipeMat, 6, 16, 16)
sph.position = [80, 80, -40]

const box = ctx.createModelInstance('box')
box.position = [-90, 25, -110]
box.scale = [50, 50, 50]
const slimeMat = Material.createSolidColour(0.1, 0.6, 0.1)
slimeMat.opacity = 0.5
const slime = ctx.createPlaneInstance(slimeMat, 120, 50, 1, 1, 1)
slime.position = [-90, 40, -110]

const dirtTex = TextureCache.instance.getCreate('../_textures/particles/water.png')
const fireTex = TextureCache.instance.getCreate('../_textures/particles/fire.png')
const lightTex = TextureCache.instance.getCreate('../_textures/particles/light_03.png')
const bubTex = TextureCache.instance.getCreate('../_textures/particles/bubble.png')
const { particleSystem: part1, instance: inst1 } = ctx.createParticleSystem(2000, 5)
inst1.position = [-20, 75, 20]
part1.texture = dirtTex
part1.minLifetime = 3
part1.maxLifetime = 5
part1.emitRate = 1800
part1.gravity = [0, -28, 0]
part1.ageColour = [2, 1.7, 0.0, 0.5]
const spread = 1.2
part1.direction1 = [-spread, 2, -spread]
part1.direction2 = [spread, 2, spread]
part1.minPower = 9
part1.maxPower = 18
part1.minSize = 1.2
part1.maxSize = 2.2
part1.minRotationSpeed = 0
part1.maxRotationSpeed = 2
part1.timeScale = 3.5

const { particleSystem: part2, instance: inst2 } = ctx.createParticleSystem(1000, 5)
inst2.position = [80, 82, -40]
part2.texture = fireTex
part2.emitRate = 400
part2.minPower = 10
part2.maxPower = 25
part2.minLifetime = 2
part2.maxLifetime = 8
part2.gravity = [0, -2, 0]
const spread2 = 0.75
part2.direction1 = [-spread2, 2, -spread2]
part2.direction2 = [spread2, 2, spread2]
part2.ageColour = [0.0, 2.0, 3.0, 1.0]
part2.minSize = 2
part2.maxSize = 4
part2.minRotationSpeed = 1.2
part2.maxRotationSpeed = 4.8
part2.timeScale = 3
part2.duration = -1
part2.acceleration = 0.985
part2.agePower = 0.7

const { particleSystem: part3, instance: inst3 } = ctx.createParticleSystem(800, 5)
inst3.position = [-90, 40, -110]
part3.texture = lightTex
part3.emitRate = 200
part3.emitterBoxMax = [57, 0.5, 19]
part3.emitterBoxMin = [-57, 0.5, -19]
part3.minPower = 2
part3.maxPower = 3
part3.maxSize = 3
part3.minSize = 1.1
part3.maxLifetime = 8
part3.minLifetime = 3
part3.direction1 = [0, 1, 0]
part3.direction2 = [0, 1, 0]
part3.ageColour = [0, 0, 0, 3.0]
part3.gravity = [0, -2, 0]
part3.timeScale = 1
part3.preColour = [0.0, 0.7, 0.0, 1.0]
part3.blendSource = ctx.gl.SRC_COLOR

const { particleSystem: part4, instance: inst4 } = ctx.createParticleSystem(80, 5)
inst4.position = [-90, 40, -110]
part4.texture = bubTex
part4.emitRate = 30
part4.emitterBoxMax = [57, 0.5, 19]
part4.emitterBoxMin = [-57, 0.5, -19]
part4.direction1 = [-0.1, 1, -0.1]
part4.direction2 = [0.1, 1, 0.1]
part4.minPower = 9
part4.maxPower = 18.5
part4.maxLifetime = 17
part4.gravity = [0, -2, 0]
part4.maxSize = 1.5
part4.minSize = 0.5

const radius = 30
let t = 0
pipe3.rotateY(Math.PI / 2)
ctx.update = (delta) => {
  t = t + delta
  const x = Math.cos(t * 4) * radius
  const z = Math.sin(t * 4) * radius
  const y = 0
  part2.positionOffset = [x, y, z]
  pipe3.rotateZ(-delta * 4)
  sph.rotateY(-delta * 4)
}

ctx.start()
