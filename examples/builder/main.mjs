import { Context, Material, RenderableBuilder } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()
ctx.start()

// Create a pyramid using RenderableBuilder
const builder = new RenderableBuilder()

const brick = Material.createBasicTexture('../_textures/brickwall.jpg', true)
const crate = Material.createBasicTexture('../_textures/STARG2.png', true)
const base = builder.newPart('pyramid-base', crate)
const sides = builder.newPart('pyramid-side', brick)

// Base on x z plane, anti-clockwise, reversed
base.addQuad([-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [0, 0], [1, 0], [1, 1], [0, 1])

// Four triangles as sides
sides.addTriangle([-1, 0, 1], [1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sides.addTriangle([1, 0, 1], [1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sides.addTriangle([1, 0, -1], [-1, 0, -1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])
sides.addTriangle([-1, 0, -1], [-1, 0, 1], [0, 2, 0], [0, 0], [1, 0], [0.5, 1])

const pyramid = ctx.createCustomInstance(builder)

ctx.camera.position = [0, 0, 6]
ctx.globalLight.setAsPosition(20, 70, 500)

ctx.update = (delta) => {
  pyramid.rotateY(0.8 * delta)
  pyramid.rotateX(0.6 * delta)
  pyramid.rotateZ(0.4 * delta)
}
