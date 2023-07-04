// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { mat4 } from 'gl-matrix'

import { getGl } from './gl.ts'
import { Light } from '../render/light.ts'
import { ModelCache } from '../models/cache.ts'
import { Camera } from '../render/camera.ts'
import { Instance } from '../models/instance.ts'
import { UniformSet } from './types.ts'

// Import shaders as hefty big strings
import fragShader from '../../shaders/frag.glsl'
import vertShader from '../../shaders/vert.glsl'

/**
 * The main context of the game. This is the main entry point for the library.
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

  public resizeable = true
  public readonly camera: Camera
  public readonly models: ModelCache
  public update: (delta: number) => void

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()
    this.prevTime = 0
    this.totalTime = 0

    // Default light
    const light = new Light()
    light.position = [10, 120, -20]
    light.color = [1, 1, 1]
    light.ambient = [0.2, 0.2, 0.2]
    this.lights[0] = light

    this.camera = new Camera()

    this.update = () => {
      // Do nothing
    }

    log.info('👑 Context created')
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
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }

    // Do this in every frame since camera can move
    const camMatrix = this.camera.matrix
    const viewMatrix = mat4.invert(mat4.create(), camMatrix)

    // Forward view matrix, only for specular lighting
    uniforms.u_camMatrix = camMatrix

    // Calculate view projection matrix
    const projection = this.camera.projectionMatrix(this.aspectRatio)
    const viewProjection = mat4.multiply(mat4.create(), projection, viewMatrix)

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.useProgram(stdGlProg.program)

    // Since we only have one light, just apply it here
    this.lights[0].apply(stdGlProg)

    // Draw all instances
    for (const instance of this.instances) {
      instance.render(this.gl, uniforms, viewProjection, stdGlProg)
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
  createInstance(modelName: string) {
    const model = this.models.get(modelName)
    if (!model) throw new Error(`Model ${modelName} not found`)

    const instance = new Instance(model, [0, 0, 0])
    this.instances.push(instance)

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
