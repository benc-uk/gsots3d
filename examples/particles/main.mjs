import { Context, Material, TextureCache } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
const lightPos = [15, 20, 8]
ctx.camera.position = [0, 130, 150]
ctx.camera.enableFPControls(0, -0.45, 0.002, 4)
ctx.camera.far = 1800
ctx.gamma = 1.0

ctx.globalLight.setAsPosition(lightPos[0], lightPos[1], lightPos[2])
const amb = 0.1
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  mapSize: 512,
  scatter: 0.8,
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

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')
ctx.createPlaneInstance(floorMat, 1000, 1000, 1, 1, 6)

const pipeMat = Material.createBasicTexture('../_textures/sci-fi.png')
pipeMat.addNormalTexture('../_textures/sci-fi_normal.png')
const pipe = ctx.createCylinderInstance(pipeMat, 8, 80, 16, 1, false)
pipe.position = [0, 40, 0]
const pipe2 = ctx.createCylinderInstance(pipeMat, 3, 80, 16, 1, false)
pipe2.position = [80, 40, -40]

const dirtTex = TextureCache.instance.getCreate('../_textures/particles/dirt.png')
const fireTex = TextureCache.instance.getCreate('../_textures/particles/fire.png')

const { particles: part1, instance: inst1 } = ctx.createParticleSystem(4000, 5)
inst1.position = [0, 75, 0]
part1.texture = dirtTex
part1.maxLifetime = 4.5
part1.minLifetime = 1.5
part1.emitRate = 1000
part1.gravity = [0, -25, 0]
part1.ageColourRed = 3.0
part1.ageColourGreen = 1.7
part1.ageColourAlpha = 0.0
const spread = 1.2
part1.direction1 = [-spread, 2, -spread]
part1.direction2 = [spread, 2, spread]
part1.maxPower = 15
part1.minPower = 10
part1.timeScale = 3.0
part1.minSize = 1.0
part1.maxSize = 2.0
part1.minRotationSpeed = 0
part1.maxRotationSpeed = 6

const { particles: part2, instance: inst2 } = ctx.createParticleSystem(2000, 5)
inst2.position = [80, 82, -40]
part2.texture = fireTex
part2.emitRate = 400
part2.maxPower = 11
part2.minPower = 5
part2.timeScale = 1.0
part2.maxLifetime = 5
part2.minLifetime = 1
part2.gravity = [0, 0, 0]
const spread2 = 0.6
part2.direction1 = [-spread2, 2, -spread2]
part2.direction2 = [spread2, 2, spread2]
part2.ageColourGreen = 2.0
part2.ageColourBlue = 3.0
part2.ageColourAlpha = 1.0
part2.minSize = 0.5
part2.maxSize = 3.0
part2.minRotationSpeed = 1.2
part2.maxRotationSpeed = 4.8

ctx.start()
