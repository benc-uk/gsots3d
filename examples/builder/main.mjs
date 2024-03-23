import { Context, Material, ModelBuilder } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
ctx.start()
// ctx.setLogLevel('debug')

// Create a pyramid using RenderableBuilder
const builder = new ModelBuilder(false)

const brickMat = Material.createBasicTexture('../_textures/brickwall.jpg', true)
const sciFiMat = Material.createBasicTexture('../_textures/sci-fi.png')
sciFiMat.addNormalTexture('../_textures/sci-fi_normal.png')
sciFiMat.diffuse = [0.7, 0.8, 0.9]
sciFiMat.specular = [0.7, 0.7, 0.7]
sciFiMat.shininess = 20
sciFiMat.reflectivity = 0.5

// Two parts each have a different material
const basePart = builder.newPart('base', sciFiMat)
const sidesPart = builder.newPart('side', brickMat)

// Base on x z plane, anti-clockwise, reversed
basePart.addQuad([-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [0, 0], [1, 0], [1, 1], [0, 1])

// Four triangles as sides
sidesPart.addTriangle([-1, 0, 1], [1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([1, 0, 1], [1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([1, 0, -1], [-1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sidesPart.addTriangle([-1, 0, -1], [-1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])

// Build the model, this creates the mesh and model and caches it
ctx.buildCustomModel(builder, 'pyramid')

const modelCount = 6
const models = []
for (let i = 0; i < modelCount; i++) {
  // Now we can create instances of the model, as many as we want
  const pyramid = ctx.createModelInstance('pyramid')
  pyramid.position = [i * 5 - 12, 0, 0]
  pyramid.scale = [1.8, 1.8, 1.8]
  models.push(pyramid)
}

ctx.camera.position = [0, 10, 20]
ctx.globalLight.setAsPosition(-15, 15, 27)

ctx.update = (delta) => {
  for (let i = 0; i < modelCount; i++) {
    const pyramid = models[i]
    pyramid.rotateY(0.1 * delta * i)
    pyramid.rotateX(0.352 * delta)
    pyramid.rotateZ(0.19 * delta * i)
  }
}
