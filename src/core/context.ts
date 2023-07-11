// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { mat4 } from 'gl-matrix'

import { getGl } from './gl.ts'
import { UniformSet } from './types.ts'
import { ModelCache } from '../models/cache.ts'
import { Light } from '../render/light.ts'
import { Camera, CameraType } from '../render/camera.ts'
import { Material } from '../render/material.ts'
import { Instance } from '../models/instance.ts'
import { PrimitiveCube, PrimitivePlane, PrimitiveSphere } from '../models/primitive.ts'

// Import shaders, tsup will inline these as text strings
import fragShaderPhong from '../../shaders/phong/glsl.frag'
import vertShaderPhong from '../../shaders/phong/glsl.vert'
import fragShaderGouraud from '../../shaders/gouraud/glsl.frag'
import vertShaderGouraud from '../../shaders/gouraud/glsl.vert'
import fragShaderFlat from '../../shaders/gouraud-flat/glsl.frag'
import vertShaderFlat from '../../shaders/gouraud-flat/glsl.vert'

import { version } from '../../package.json'
import { HUD } from './hud.ts'

/**
 * The set of supported shader programs that can be used
 */
export enum ShaderProgram {
  PHONG = 'phong',
  GOURAUD = 'gouraud',
  GOURAUD_FLAT = 'gouraud-flat',
}

/**
 * The main rendering context. This is the effectively main entry point for the library.
 * Typically you will create a single instance of this class using init() and use it to render your scene.
 */
export class Context {
  private gl: WebGL2RenderingContext
  private aspectRatio = 1
  private programs: { [key: string]: ProgramInfo } = {}
  private started = false
  private instances: Instance[] = []
  private lights: Light[] = []
  private prevTime: number
  private totalTime: number
  private debugDiv: HTMLDivElement

  /** Main camera for this context */
  public readonly camera: Camera

  /** Cache of models, used to create instances */
  public readonly models: ModelCache

  /** If the canvas can be resized, set this to true, otherwise it's an optimization to set to false */
  public resizeable = true

  /** Show extra debug details on the canvas */
  public debug = false

  /** The pre-render update hook function */
  public update: (delta: number) => void

  /** The level & colour of ambient light */
  public ambientLight: [number, number, number] = [0.05, 0.05, 0.05]

  /** The shader program to use for rendering */
  public shaderProgram = ShaderProgram.PHONG

  /** A HUD you can use to render HTML elements over the canvas */
  public readonly hud: HUD

  /**
   * Constructor is private, use init() to create a new context
   */
  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()
    this.prevTime = 0
    this.totalTime = 0

    // Default light
    const light = new Light()
    light.position = [0, 40, 50]
    light.colour = [1, 1, 1]
    this.lights[0] = light

    this.camera = new Camera(CameraType.PERSPECTIVE)

    this.update = () => {
      // Placeholder empty update function
    }

    this.hud = new HUD(<HTMLCanvasElement>gl.canvas)

    this.debugDiv = document.createElement('div')
    this.debugDiv.classList.add('gsots3d-debug')
    this.debugDiv.style.padding = '15px'
    this.hud.addHUDItem(this.debugDiv)

    log.info(`👑 GSOTS-3D context created, v${version}`)
  }

  /**
   * Create & initialize a new Context which will render into provided canvas selector
   */
  static async init(canvasSelector: string, backgroundColour = '#000'): Promise<Context> {
    const gl = getGl(true, canvasSelector)

    if (!gl) {
      log.error('💥 Failed to get WebGL context')
      throw new Error('Failed to get WebGL context')
    }

    const ctx = new Context(gl)

    const canvas = <HTMLCanvasElement>gl.canvas
    ctx.aspectRatio = canvas.clientWidth / canvas.clientHeight
    canvas.style.backgroundColor = backgroundColour

    try {
      const phongProg = createProgramInfo(gl, [vertShaderPhong, fragShaderPhong])
      ctx.programs[ShaderProgram.PHONG] = phongProg

      const gouraudProg = createProgramInfo(gl, [vertShaderGouraud, fragShaderGouraud])
      ctx.programs[ShaderProgram.GOURAUD] = gouraudProg

      const flatProg = createProgramInfo(gl, [vertShaderFlat, fragShaderFlat])
      ctx.programs[ShaderProgram.GOURAUD_FLAT] = flatProg

      log.info('🎨 Loaded all shaders & programs, GL is ready')
    } catch (err) {
      log.error(err)
      throw err
    }

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // bind to the render function
    ctx.render = ctx.render.bind(ctx)

    return ctx
  }

  /**
   * Main render loop, called every frame
   */
  private async render(now: number) {
    if (!this.gl) return

    now *= 0.001
    const deltaTime = now - this.prevTime // Get smoothed time difference
    this.prevTime = now
    this.totalTime += deltaTime

    // Call the external update function
    this.update(deltaTime)

    const uniforms = {
      u_worldInverseTranspose: mat4.create(),
      u_worldViewProjection: mat4.create(),
      u_ambientLight: [...this.ambientLight, 1],
    } as UniformSet

    const shaderProg = this.programs[this.shaderProgram]

    if (this.resizeable) {
      resizeCanvasToDisplaySize(<HTMLCanvasElement>this.gl.canvas)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
      this.aspectRatio = this.gl.canvas.width / this.gl.canvas.height
    }

    // Do this in every frame since camera can move
    const camMatrix = this.camera.matrix
    const viewMatrix = mat4.invert(mat4.create(), camMatrix)

    // Forward view matrix, only for specular lighting
    uniforms.u_camMatrix = camMatrix

    // Calculate view projection matrix
    const projection = this.camera.projectionMatrix(this.aspectRatio)
    const viewProjection = mat4.multiply(mat4.create(), projection, viewMatrix)

    // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.useProgram(shaderProg.program)

    // Since we only have one light, just apply it here
    this.lights[0].apply(shaderProg)

    // Draw all instances
    for (const instance of this.instances) {
      instance.render(this.gl, uniforms, viewProjection, shaderProg)
    }

    // Draw the debug HUD
    if (this.debug) {
      this.debugDiv.innerHTML = `
        <b>GSOTS-3D v${version}</b><br><br>
        <b>Camera: </b>${this.camera.toString()}<br>
        <b>Instances: </b>${this.instances.length}<br>
        <b>Render: </b>FPS: ${Math.round(1 / deltaTime)} / ${Math.round(this.totalTime)}s<br>
      `
    }

    // Loop forever or not
    if (this.started) requestAnimationFrame(this.render)
  }

  /**
   * Get the default light
   */
  get defaultLight() {
    return this.lights[0]
  }

  /**
   * Start the rendering loop
   */
  start() {
    this.started = true
    requestAnimationFrame(this.render)
  }

  /**
   * Stop the rendering loop
   */
  stop() {
    this.started = false
  }

  /**
   * Create a new model instance, which should have been previously loaded into the cache
   * @param modelName - Name of the model previously loaded into the cache
   */
  createModelInstance(modelName: string) {
    const model = this.models.get(modelName)
    if (!model) throw new Error(`💥 Model ${modelName} not found`)

    const instance = new Instance(model)
    this.instances.push(instance)

    return instance
  }

  /**
   * Create an instance of a primitive sphere
   */
  createSphereInstance(material: Material, radius = 5, subdivisionsH = 16, subdivisionsV = 8) {
    const sphere = new PrimitiveSphere(this.gl, radius, subdivisionsH, subdivisionsV)
    sphere.material = material

    const instance = new Instance(sphere)
    this.instances.push(instance)

    log.debug(`🟢 Created sphere instance, r:${radius}`)

    return instance
  }

  /**
   * Create an instance of a primitive plane
   */
  createPlaneInstance(material: Material, width = 5, height = 5, subdivisionsW = 1, subdivisionsH = 1) {
    const plane = new PrimitivePlane(this.gl, width, height, subdivisionsW, subdivisionsH)
    plane.material = material

    const instance = new Instance(plane)
    this.instances.push(instance)

    log.debug(`🟨 Created plane instance, w:${width} h:${height}`)

    return instance
  }

  /**
   * Create an instance of a primitive cube
   */
  createCubeInstance(material: Material, size = 5) {
    const cube = new PrimitiveCube(this.gl, size)
    cube.material = material

    const instance = new Instance(cube)
    this.instances.push(instance)

    log.debug(`📦 Created cube instance, size:${size}`)

    return instance
  }
}
