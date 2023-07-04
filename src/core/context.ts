import log from 'loglevel'
import { getGl } from './gl.ts'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { Light, ModelCache } from '../index.ts'
import { Instance } from '../models/instance.ts'
import { UniformSet } from './types.ts'
import { mat4 } from 'gl-matrix'

// Import shaders as hefty big strings
import fragShader from '../../shaders/frag.glsl'
import vertShader from '../../shaders/vert.glsl'

export class Context {
  private gl: WebGL2RenderingContext | undefined
  private aspectRatio = 4 / 3
  private programs: { [key: string]: ProgramInfo } = {}
  private started = false
  public readonly models: ModelCache
  private instances: Instance[] = []
  public resizeable = true
  private lights: Light[] = []

  private prevTime: number
  private totalTime: number

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
    this.lights.push(light)
  }

  public static async init(canvasSelector: string): Promise<Context> {
    const gl = getGl(true, canvasSelector)

    if (!gl) {
      log.error('💥 Failed to get WebGL context')
      throw new Error('Failed to get WebGL context')
    }

    const ctx = new Context(gl)

    const w = (<HTMLCanvasElement>gl.canvas).clientWidth
    const h = (<HTMLCanvasElement>gl.canvas).clientHeight
    ctx.aspectRatio = w / h

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

    // bind this to the render function
    ctx.render = ctx.render.bind(ctx)

    return ctx
  }

  private async render(now: number) {
    if (!this.gl) return

    now *= 0.001
    const deltaTime = now - this.prevTime // Get smoothed time difference
    this.prevTime = now
    this.totalTime += deltaTime

    const uniforms = {
      u_worldInverseTranspose: mat4.create(),
      u_worldViewProjection: mat4.create(),
    } as UniformSet

    uniforms.ewrwer = 1.12

    const mainProg = this.programs['standard']

    // Since we only have one light, just apply it here
    this.lights[0].apply(mainProg)

    if (this.resizeable) {
      resizeCanvasToDisplaySize(<HTMLCanvasElement>this.gl.canvas)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }

    // Do this in every frame since the window and therefore the aspect ratio of projection matrix might change
    const camera = mat4.targetTo(mat4.create(), [0, 14, 30], [0, 0, 0], [0, 1, 0])
    const view = mat4.invert(mat4.create(), camera)
    uniforms.u_viewInverse = camera // Add the view inverse to the uniforms, we need it for shading

    const perspective = mat4.perspective(mat4.create(), (50 * Math.PI) / 180, this.aspectRatio, 0.1, 1000)
    const viewProjection = mat4.multiply(mat4.create(), perspective, view)

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    this.gl.useProgram(mainProg.program)

    // Draw all instances
    for (const instance of this.instances) {
      instance.render(this.gl, uniforms, viewProjection, mainProg)
    }

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

  createInstance(modelName: string) {
    const model = this.models.getModel(modelName)
    if (!model) throw new Error(`Model ${modelName} not found`)

    const instance = new Instance(model, [0, 0, 0])
    this.instances.push(instance)

    return instance
  }

  get defaultLight() {
    return this.lights[0]
  }
}
