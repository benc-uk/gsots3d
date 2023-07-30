import { Camera, Context, Material, setLogLevel } from '../../dist-bundle/gsots3d.js'

const ctx = await Context.init()
ctx.debug = true
setLogLevel('info')

ctx.camera.position = [15, 30, 66]
ctx.globalLight.setAsPosition(2, 1, 0)
ctx.globalLight.ambient = [0.1, 0.1, 0.1]
ctx.camera.far = 500

ctx.camera.enableFPControls(0, -0.2, 0.002, 0.7)

const wallMat = Material.createBasicTexture('../_textures/brickwall.jpg', true, false)
wallMat.addNormalTexture('../_textures/brickwall_normal.jpg', true, false)
wallMat.specular = [0.9, 0.7, 0.4]
wallMat.shininess = 300

const wall = ctx.createPlaneInstance(wallMat, 200, 200, 1, 1, 4)
wall.rotateX(Math.PI / 2)
wall.position = [0, 0, -50]
wall.flipTextureX = true

const wall2 = ctx.createPlaneInstance(wallMat, 200, 200, 1, 1, 4)
wall2.rotateX(-Math.PI / 2)
wall2.position = [0, 0, 100]
wall2.flipTextureX = true

const floor = ctx.createPlaneInstance(wallMat, 200, 200, 1, 1, 4)
floor.flipTextureX = false
floor.flipTextureY = true

const cam2 = new Camera()
cam2.position = [10, 20, 30]
cam2.lookAt = [0, 18, 0]
cam2.far = 666
ctx.addCamera('cam2', cam2)

const crateMat = Material.createBasicTexture('../_textures/crate.png')
const cube = ctx.createCubeInstance(crateMat, 20)
cube.position = [7, 10, 1]
cube.flipTextureY = true

ctx.start()

window.addEventListener('keydown', (e) => {
  if (e.key === '0') {
    ctx.debug = !ctx.debug
  }

  // switch cameras with c
  if (e.key === 'c') {
    if (ctx.activeCameraName === 'default') {
      ctx.setActiveCamera('cam2')
    } else {
      ctx.setActiveCamera('default')
    }
  }
})
