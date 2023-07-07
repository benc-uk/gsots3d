import { Context } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.createSphereInstance(4, 12, 12)
ctx.start()
