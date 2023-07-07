// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { mat4 } from 'gl-matrix'

import { Material, VERSION } from '../index.ts'
import { getGl } from './gl.ts'
import { UniformSet } from './types.ts'
import { Light } from '../render/light.ts'
import { ModelCache } from '../models/cache.ts'
import { Camera } from '../render/camera.ts'
import { Instance } from '../models/instance.ts'

// Import shaders as hefty big strings
import fragShader from '../../shaders/frag.glsl'
import vertShader from '../../shaders/vert.glsl'
import { PrimitiveSphere } from '../models/primitive.ts'

/**
 * The main rendering context. This is the main entry point for the library.
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
  private ctx2D: CanvasRenderingContext2D | undefined

  /** Main camera for the */
  public readonly camera: Camera

  /** Cache of models, used to create instances */
  public readonly models: ModelCache

  public resizeable = true
  public debug = false
  public update: (delta: number) => void

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()
    this.prevTime = 0
    this.totalTime = 0

    // Default light
    const light = new Light()
    light.position = [0, 40, 50]
    light.color = [1, 1, 1]
    light.ambient = [0.2, 0.2, 0.2]
    this.lights[0] = light

    this.camera = new Camera()

    this.update = () => {
      // Do nothing
    }

    log.info('👑 GSOTS-3D context created')
  }

  static async init(canvasSelector: string): Promise<Context> {
    const gl = getGl(true, canvasSelector)

    if (!gl) {
      log.error('💥 Failed to get WebGL context')
      throw new Error('Failed to get WebGL context')
    }

    const ctx = new Context(gl)

    const canvas = <HTMLCanvasElement>gl.canvas
    ctx.aspectRatio = canvas.clientWidth / canvas.clientHeight

    // HACK: Ugly hack to get 2D canvas context
    const textCanvas = document.createElement('canvas')
    textCanvas.width = canvas.clientWidth
    textCanvas.height = canvas.clientHeight
    textCanvas.style.backgroundColor = 'transparent'
    document.getElementById('game')?.appendChild(textCanvas)
    const ctx2D = textCanvas.getContext('2d')
    if (!ctx2D) {
      log.error('💥 Failed to get 2D canvas context')
      throw new Error('Failed to get 2D canvas context')
    }
    ctx.ctx2D = ctx2D

    try {
      const modelProg = createProgramInfo(gl, [vertShader, fragShader])
      ctx.programs['standard'] = modelProg

      log.info('🎨 Loaded all shaders, GL is ready')
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
    } as UniformSet

    const stdGlProg = this.programs['standard']

    if (this.resizeable) {
      resizeCanvasToDisplaySize(<HTMLCanvasElement>this.gl.canvas)
      resizeCanvasToDisplaySize(<HTMLCanvasElement>this.ctx2D?.canvas)
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
    this.gl.useProgram(stdGlProg.program)

    // Since we only have one light, just apply it here
    this.lights[0].apply(stdGlProg)

    // Draw all instances
    for (const instance of this.instances) {
      instance.render(this.gl, uniforms, viewProjection, stdGlProg)
    }

    if (this.ctx2D && this.debug) {
      this.ctx2D.clearRect(0, 0, this.ctx2D.canvas.width, this.ctx2D.canvas.height)
      this.ctx2D.fillStyle = 'white'
      this.ctx2D.font = '19px monospace'
      this.ctx2D.fillText(`GSOTS-3D v${VERSION}`, 10, 20)
      this.ctx2D.fillText(`FPS: ${Math.round(1 / deltaTime)}`, 10, 40)
      this.ctx2D.fillText(`Time: ${Math.round(this.totalTime * 100) / 100}`, 10, 60)
    }

    // Loop forever or not
    if (this.started) requestAnimationFrame(this.render)
  }

  start() {
    // Start the render loop
    this.started = true
    requestAnimationFrame(this.render)
  }

  stop() {
    this.started = false
  }

  /**
   * Add an instance of a model to the cache and return it
   * @param modelName
   * @returns {Instance} A new instance of the model
   */
  createModelInstance(modelName: string) {
    const model = this.models.get(modelName)
    if (!model) throw new Error(`Model ${modelName} not found`)

    const instance = new Instance(model)
    this.instances.push(instance)

    return instance
  }

  /**
   * Add an instance of a primitive sphere
   * @param radius - Radius of sphere
   * @param subdivisionsH - sub divisions around the horizontal axis
   * @param subdivisionsV
   * @returns
   */
  createSphereInstance(material: Material, radius = 5, subdivisionsH = 16, subdivisionsV = 8) {
    const sphere = new PrimitiveSphere(this.gl, radius, subdivisionsH, subdivisionsV)
    sphere.material = material

    const instance = new Instance(sphere)
    this.instances.push(instance)

    log.debug(`🟢 Created sphere instance, r:${radius} with ${subdivisionsH}x${subdivisionsV} subdivisions`)

    return instance
  }

  /**
   * Get the default light
   * @returns {Light} The default light
   */
  get defaultLight() {
    return this.lights[0]
  }
}
