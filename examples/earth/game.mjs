import { Context, Material, ShaderProgram } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true

ctx.shaderProgram = ShaderProgram.GOURAUD
ctx.shaderProgram = ShaderProgram.GOURAUD_FLAT
ctx.shaderProgram = ShaderProgram.PHONG

ctx.camera.position = [0, 0, 20]
ctx.globalLight.setAsPosition(8, 20, 18)
ctx.ambientLight = [0.1, 0.1, 0.1]

const mat = Material.createBasicTexture('../textures/earth.jpg')
mat.specular = [0.7, 0.7, 0.7]
mat.shininess = 50

const sphere = ctx.createSphereInstance(mat, 5, 32, 32)

ctx.update = () => {
  sphere.rotateY(0.01)
}

ctx.start()
