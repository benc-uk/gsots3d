import { Context, Material, TextureCache, Stats } from '../../dist-single/gsots3d.js'

// Create context with default canvas
const ctx = await Context.init()

const t1 = TextureCache.instance.getCreate('../_textures/earth.jpg')
const t2 = TextureCache.instance.getCreate('../_textures/mellon.jpg')
const m = new Material()
// const m = Material.createBasicTexture('../_textures/earth.jpg')
// const m = Material.RED

m.diffuseTex = t1
// Create a red sphere of radius 5
ctx.createSphereInstance(m, 5.0)

// Start rendering
ctx.start()

ctx.update = (dt) => {
  if (Stats.frameCount % 10 === 0) {
    m.diffuseTex = m.diffuseTex === t1 ? t2 : t1
  }
}
