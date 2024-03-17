import { Context, Material, ModelBuilder } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
ctx.start()
ctx.setLogLevel('debug')

// Create a pyramid using RenderableBuilder
const builder = new ModelBuilder(false)

const brickMat = Material.createBasicTexture('../_textures/brickwall.jpg', true)
const crateMat = Material.createBasicTexture('../_textures/STARG2.png', true)
const basePart = builder.newPart('base', crateMat)
const sidesPart = builder.newPart('side', brickMat)

// Base on x z plane, anti-clockwise, reversed
basePart.addQuad([-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [0, 0], [1, 0], [1, 1], [0, 1])

// Four triangles as sides
sidesPart.addTriangle([-1, 0, 1], [1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([1, 0, 1], [1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([1, 0, -1], [-1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([-1, 0, -1], [-1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])

ctx.buildCustomModel(builder, 'pyramid')
const pyramid = ctx.createModelInstance('pyramid')
pyramid.scale = [2, 2, 2]
ctx.createSphereInstance(Material.GREEN, 2.5, 16, 16)

ctx.camera.position = [0, 10, 10]
ctx.globalLight.setAsPosition(111, -30, 0)

// pyramid.rotateY(0.7)
ctx.update = (delta) => {
  pyramid.rotateY(0.8 * delta)
  // pyramid.rotateX(0.6 * delta)
  // pyramid.rotateZ(0.4 * delta)
}
