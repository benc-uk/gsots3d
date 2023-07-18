import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true
window.addEventListener('resize', () => ctx.resize())

ctx.camera.position = [0, 6, 20]
ctx.globalLight.setAsPosition(18, 30, 18)
ctx.globalLight.ambient = [0.15, 0.15, 0.15]

const mat = Material.createBasicTexture('../_textures/earth.jpg')
mat.specular = [0.7, 0.7, 0.7]
mat.shininess = 50

const sphere = ctx.createSphereInstance(mat, 7, 32, 32)

ctx.update = () => {
  sphere.rotateY(0.007)
}

ctx.start()
