import { Context, Material, ShaderProgram } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true
ctx.shaderProgram = ShaderProgram.GOURAUD
ctx.shaderProgram = ShaderProgram.PHONG
ctx.camera.position = [0, 0, 20]
ctx.defaultLight.position = [80, 60, 50]
ctx.ambientLight = [0.04, 0.04, 0.04]

const mat = Material.createTexture('../textures/earth.jpg')
mat.specular = [0.7, 0.7, 0.7]
mat.shininess = 50

const sphere = ctx.createSphereInstance(mat, 5, 32, 32)

ctx.update = () => {
  sphere.rotateY(0.01)
}

ctx.start()
