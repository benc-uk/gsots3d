import { Context, Material } from '../../dist-bundle/gsots3d.js'

// Create context with default canvas
const ctx = await Context.init()

// Create a red sphere of radius 5
ctx.createSphereInstance(Material.RED, 5.0)

// Start rendering
ctx.start()
