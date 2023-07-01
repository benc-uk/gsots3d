// ===== main.mjs ==========================================================
// Core engine loop
// Ben Coleman, 2023
// ===============================================================================

import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'
import * as vec3 from '../lib/gl-matrix/esm/vec3.js'
import { fetchShaders, getGl, setOverlay } from './utils.mjs'
import { Sprite } from './sprites.mjs'
import { Instance, loadModel } from './models.mjs'
import { Player } from './player.mjs'
import { bindControls } from './control.mjs'
import { Zone } from './zone.mjs'

const FAR_CLIP = 300
const AA_ENABLED = true
const LIGHT_COLOUR = [1, 0.9, 0.85] //[0.997, 0.682, 0.392]
const BUILD_VER = '0002'

/**
 * @typedef {object} cameraParam
 * @property {number} angle Used to rotate the camera
 * @property {number} height Used to move the camera up and down
 * @property {number} zoom Used to set the viewport size
 */
const cameraParam = {
  angle: 0,
  height: 0,
  zoom: 50,
}
const retroMode = false

/** @type {WebGL2RenderingContext} */
let gl

/** @type {Array<Instance>} */
let zoneInstances = []

// **** Start here ****
window.onload = async () => {
  setOverlay(
    'WebGL Isometric Game Engine<br><br>Move player: cursor keys<br>Camera height: Z,X<br>Camera angle: Q,E<br>Zoom: +,=<br>Toggle retro mode: R<br><br>Build: ' +
      BUILD_VER
  )

  gl = getGl(AA_ENABLED)
  // If we don't have a GL context, give up now
  if (!gl) {
    setOverlay('Unable to initialize WebGL. Your browser or machine may not support it!')
    return
  }

  // @ts-ignore
  const ASPECT = gl.canvas.clientWidth / gl.canvas.clientHeight

  const player = new Player()
  player.setTilePosition(2, 1)

  // Bind keyboard controls
  bindControls(player, cameraParam, retroMode)

  // Use TWLG to set up the shaders and programs
  // We have two programs and two pairs of shaders, one for 3D elements (models) and one for sprites
  let modelProg, spriteProg
  try {
    // Note, we load shaders from external files, that's how I like to work
    const { vertex: modelVert, fragment: modelFrag } = await fetchShaders('shaders/vert.glsl', 'shaders/frag.glsl')
    modelProg = twgl.createProgramInfo(gl, [modelVert, modelFrag])

    const { vertex: spriteVert, fragment: spriteFrag } = await fetchShaders('shaders/sprite-vert.glsl', 'shaders/sprite-frag.glsl')
    spriteProg = twgl.createProgramInfo(gl, [spriteVert, spriteFrag])

    console.log('🎨 Loaded all shaders, GL is ready')
  } catch (err) {
    console.error(err)
    setOverlay(err.message)
    return // Give up here!
  }

  loadModel('floor')
  loadModel('block')
  loadModel('table')
  loadModel('chest')
  loadModel('door')

  const zone1 = new Zone(3, 4)
  const zone2 = new Zone(5, 5)
  zone1.tiles[0][2].setExit(zone2, 1, 4)
  zone2.tiles[0][4].setExit(zone1, 1, 2)

  zone1.tiles[5][1].floor()
  zone1.tiles[4][1].floor()
  zone1.tiles[3][4].floor()
  zone1.tiles[3][5].floor()

  player.zoneChangeCallback = async (zone) => {
    zoneInstances = zone.buildInstances()
  }
  player.setZone(zone1)

  const worldUniforms = {
    u_lightWorldPos: [0, 0, 0], // Updated in render loop
    u_lightColor: LIGHT_COLOUR,
    u_lightAmbient: [0.1, 0.1, 0.1],
  }

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  /**
   * Draw the scene repeatedly every frame
   *
   * @param {number} _now - The DOMHighResTimeStamp from requestAnimationFrame
   */
  async function render(_now) {
    // Handle camera movement & rotation
    const camTarget = vec3.fromValues(0, 0, 0)
    const camPos = vec3.fromValues(10, 8 + cameraParam.height, 10)
    vec3.rotateY(camPos, camPos, camTarget, cameraParam.angle)
    vec3.add(camPos, camPos, player.position)
    vec3.add(camTarget, camTarget, player.position)

    const camera = mat4.targetTo(mat4.create(), camPos, camTarget, [0, 1, 0])
    const view = mat4.invert(mat4.create(), camera)
    worldUniforms.u_viewInverse = camera // Add the view inverse to the uniforms, we need it for shading

    // Move the light to the player position
    worldUniforms.u_lightWorldPos = [player.position[0] + 4, player.position[1] + 12, player.position[2] + 4]

    // An isometric projection
    const projection = mat4.ortho(
      mat4.create(),
      -ASPECT * cameraParam.zoom,
      ASPECT * cameraParam.zoom,
      -cameraParam.zoom,
      cameraParam.zoom,
      -FAR_CLIP,
      FAR_CLIP
    )
    const viewProjection = mat4.multiply(mat4.create(), projection, view)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Draw the sprites first
    gl.disable(gl.BLEND)
    gl.useProgram(spriteProg.program)
    renderSprite(player.sprite, spriteProg, view, projection)

    // Draw the models/instances
    gl.useProgram(modelProg.program)
    for (const instance of zoneInstances) {
      gl.disable(gl.BLEND)
      if (instance.transparent) {
        gl.enable(gl.BLEND)
      }

      renderInstance(instance, modelProg, worldUniforms, viewProjection)
    }

    // Render forever
    requestAnimationFrame(render)
  }

  // Start the render loop first time
  requestAnimationFrame(render)
}

/**
 * Render a model instance
 *
 * @param {Instance} instance - The instance to render
 * @param {twgl.ProgramInfo|any} programInfo - The GL program to use
 * @param {object} uniforms - The uniforms to use when rendering
 * @param {mat4} viewProjection - The combined view projection matrix
 */
function renderInstance(instance, programInfo, uniforms, viewProjection) {
  // Uniforms for this instance
  uniforms = {
    ...uniforms,
    u_worldInverseTranspose: mat4.create(),
    u_worldViewProjection: mat4.create(),
    u_transparency: instance.transparent ? 0.4 : 1,
  }

  // World transform places the instance into the world
  const world = mat4.create()
  if (instance.position) mat4.translate(world, world, instance.position)
  if (instance.rotate) {
    mat4.rotate(world, world, instance.rotate[0], [1, 0, 0])
    mat4.rotate(world, world, instance.rotate[1], [0, 1, 0])
    mat4.rotate(world, world, instance.rotate[2], [0, 0, 1])
  }
  if (instance.scale) {
    mat4.scale(world, world, instance.scale)
  }
  uniforms.u_world = world

  // Populate u_worldInverseTranspose - used for normals & shading
  mat4.invert(uniforms.u_worldInverseTranspose, world)
  mat4.transpose(uniforms.u_worldInverseTranspose, uniforms.u_worldInverseTranspose)

  // Populate u_worldViewProjection which is pretty fundamental
  mat4.multiply(uniforms.u_worldViewProjection, viewProjection, world)

  const model = instance.model
  for (const part of model.parts) {
    model.materials[part.materialName].apply(programInfo)

    twgl.setBuffersAndAttributes(gl, programInfo, part.bufferInfo)
    twgl.setUniforms(programInfo, uniforms)

    twgl.drawBufferInfo(gl, part.bufferInfo)
  }
}

/**
 * Render a sprite
 *
 * @param {Sprite} sprite - The sprite to render
 * @param {twgl.ProgramInfo|any} programInfo - The GL program to use
 * @param {mat4} view - The view matrix, Note. not combined with projection
 * @param {mat4} projection - The projection matrix, Note. not combined with view
 */
function renderSprite(sprite, programInfo, view, projection) {
  const uniforms = {
    u_texture: sprite.texture,
    u_worldViewProjection: mat4.create(),
    u_world: mat4.create(),
  }

  // Move sprite into the world
  mat4.translate(uniforms.u_world, uniforms.u_world, sprite.position)

  // World view before projection, intermediate step for billboarding
  const worldView = mat4.multiply(mat4.create(), view, uniforms.u_world)

  // For billboarding
  // https://www.geeks3d.com/20140807/billboarding-vertex-shader-glsl/
  worldView[0] = 1.0
  worldView[1] = 0
  worldView[2] = 0
  worldView[5] = 1.0
  worldView[8] = 0
  worldView[9] = 0
  worldView[10] = 1.0

  // Populate u_worldViewProjection which is pretty fundamental
  mat4.multiply(uniforms.u_worldViewProjection, projection, worldView)

  twgl.setBuffersAndAttributes(gl, programInfo, sprite.buffers)
  twgl.setUniforms(programInfo, uniforms)
  twgl.drawBufferInfo(gl, sprite.buffers)
}
