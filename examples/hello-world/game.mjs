import { Context, Material } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()

const red = Material.RED
red.specular = [1.0, 1.0, 1.0]
red.shininess = 100

ctx.createSphereInstance(red, 5, 12, 12)

ctx.start()
