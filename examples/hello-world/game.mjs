import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.ambientLight = [0.04, 0.04, 0.04]
ctx.defaultLight.position = [40, 40, 20]
ctx.defaultLight.colour = [1.0, 1.0, 1.0]

const m = Material.createTexture('../textures/stone-wall.png')
m.specular = [1.0, 1.0, 1.0]
m.diffuse = [1.0, 1.0, 1.0]
m.ambient = [1.0, 1.0, 1.0]
m.shininess = 300

ctx.createSphereInstance(m, 5)
ctx.start()
