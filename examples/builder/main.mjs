import { Context, Material, RenderableBuilder } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
ctx.start()

// Create a pyramid using RenderableBuilder
const builder = new RenderableBuilder()

// Base on x z plane, anti-clockwise, reversed
builder.addQuad([-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [0, 0], [1, 0], [1, 1], [0, 1])

// Four triangles as sides
builder.addTriangle([-1, 0, 1], [1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
builder.addTriangle([1, 0, 1], [1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
builder.addTriangle([1, 0, -1], [-1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
builder.addTriangle([-1, 0, -1], [-1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])

const m = Material.createBasicTexture('../_textures/brickwall.jpg', true)
const pyramid = ctx.createCustomInstance(builder, m)

ctx.camera.position = [0, 0, 6]
ctx.globalLight.setAsPosition(20, 70, 500)

ctx.update = (delta) => {
  pyramid.rotateY(0.8 * delta)
  pyramid.rotateX(0.6 * delta)
  pyramid.rotateZ(0.4 * delta)
}
