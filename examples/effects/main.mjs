import { Context, Material } from '../../dist-single/gsots3d.js'

const ctx = await Context.init()

ctx.camera.position = [0, 25, 55]
ctx.camera.enableFPControls(0, -0.3)
ctx.camera.far = 1000

ctx.globalLight.setAsPosition(5, 8, 5)
ctx.globalLight.ambient = [0.1, 0.1, 0.1]
ctx.globalLight.enableShadows({
  mapSize: 2048,
  zoom: 140,
  distance: 500,
})

// Load models
try {
  await ctx.loadModel('../_objects', 'teapot.obj')
  await ctx.loadModel('../_objects/dice', 'dice.obj')
  await ctx.loadModel('../_objects', 'wine.obj')
} catch (e) {
  console.error(e)
}

// Materials
const matBlue = Material.createSolidColour(0.2, 0.3, 0.9)
matBlue.shininess = 55
matBlue.specular = [1.0, 1.0, 1.0]

const crateMat = Material.createBasicTexture('../_textures/crate.png')
crateMat.addSpecularTexture('../_textures/crate-specular.png')
crateMat.specular = [1.0, 1.0, 1.0]
crateMat.shininess = 8

const floorMat = Material.createBasicTexture('../_textures/wood-floor.png')

// Model instances
const crate = ctx.createCubeInstance(crateMat, 10)
crate.position = [0, 0, 0]
crate.scale = [3, 1, 3]

const teapot = ctx.createModelInstance('teapot')
teapot.scale = [2, 2, 2]
teapot.position = [8, 4.5, 8]
teapot.material = matBlue
teapot.rotateYDeg(-22)

const dice = ctx.createModelInstance('dice')
dice.scale = [2, 2, 2]
dice.position = [-8, 7.0, 8]
dice.rotateZDeg(90)
dice.rotateXDeg(-22)

const dice2 = ctx.createModelInstance('dice')
dice2.scale = [2, 2, 2]
dice2.position = [8, 7.0, -8]
dice2.rotateYDeg(-65)

const wine = ctx.createModelInstance('wine')
wine.scale = [0.8, 0.8, 0.8]
wine.position = [-8, 4.5, -8]
wine.rotateXDeg(-90)

const floor = ctx.createCubeInstance(floorMat, 10, 14)
floor.position = [0, -10.1, 0]
floor.scale = [40, 1, 40]

// Setup UX and start
const note = document.createElement('div')
note.style.width = '100%'
note.style.textAlign = 'center'
note.style.fontSize = '2vw'
note.style.textShadow = '3px 3px 2px rgba(0,0,0,0.8)'
ctx.hud.addHUDItem(note)

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    effectNum++
    if (effectNum > 6) effectNum = 0

    switchEffect(effectNum)
  }
})

let effectNum = 0
switchEffect(effectNum)

ctx.start()

// Toggle between effects
function switchEffect(effectNum) {
  switch (effectNum) {
    case 0:
      customEdgeEffect(6.0, 2.0)
      note.innerHTML = 'Effect: Custom<br>Press space to change'
      break
    case 1:
      ctx.setEffectGlitch()
      note.innerHTML = 'Effect: Glitch<br>Press space to change'
      break
    case 2:
      ctx.setEffectDuotone()
      note.innerHTML = 'Effect: DuoTone<br>Press space to change'
      break
    case 3:
      ctx.setEffectScanlines()
      note.innerHTML = 'Effect: Scanlines<br>Press space to change'
      break
    case 4:
      ctx.setEffectNoise()
      note.innerHTML = 'Effect: Noise<br>Press space to change'
      break
    case 5:
      ctx.setEffectContrast()
      note.innerHTML = 'Effect: Contrast<br>Press space to change'
      break
    case 6:
      ctx.removeEffect()
      note.innerHTML = 'Effect: None<br>Press space to change'
      break
  }
}

function customEdgeEffect(speed = 4.0, scale = 2.0) {
  // This shader is a Sobel filter with a rainbow effect
  ctx.setEffectCustom(`
    float speed = ${speed.toFixed(2)};
    float scale = ${scale.toFixed(2)};
  
    vec3 rainbow(float t) {
      return vec3(
        sin(t * 0.3) * 0.5 + 0.5,
        sin(t * 0.3 + 2.0) * 0.5 + 0.5,
        sin(t * 0.3 + 4.0) * 0.5 + 0.5
      );
    }
  
    void main() {
      // Sobel filter
      vec2 texel = vec2(1.0 / width, 1.0  /height) * scale;
  
      float gx = 0.0;
      float gy = 0.0;
      gx += texture(image, pos + texel * vec2(-1, -1)).r * 1.0;
      gx += texture(image, pos + texel * vec2(-1, 0)).r * 2.0;
      gx += texture(image, pos + texel * vec2(-1, 1)).r * 1.0;
      gx += texture(image, pos + texel * vec2(1, -1)).r * -1.0;
      gx += texture(image, pos + texel * vec2(1, 0)).r * -2.0;
      gx += texture(image, pos + texel * vec2(1, 1)).r * -1.0;
      gy += texture(image, pos + texel * vec2(-1, -1)).r * 1.0;
      gy += texture(image, pos + texel * vec2(0, -1)).r * 2.0;
      gy += texture(image, pos + texel * vec2(1, -1)).r * 1.0;
      gy += texture(image, pos + texel * vec2(-1, 1)).r * -1.0;
      gy += texture(image, pos + texel * vec2(0, 1)).r * -2.0;
      gy += texture(image, pos + texel * vec2(1, 1)).r * -1.0;
      float g = sqrt(gx * gx + gy * gy);
      
      // Cycle through the rainbow with time
      vec3 color = rainbow(time * speed);
      color *= g;
  
      pixel = vec4(color, 1.0);
    }
  `)
}
