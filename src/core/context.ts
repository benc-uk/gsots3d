import log from 'loglevel'
import { getGl } from './gl.ts'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { Light } from '../render/light.ts'
import { ModelCache } from '../models/cache.ts'
import { Camera } from '../render/camera.ts'
import { Instance } from '../models/instance.ts'
import { UniformSet } from './types.ts'
import { mat4 } from 'gl-matrix'

// Import shaders as hefty big strings
import fragShader from '../../shaders/frag.glsl'
import vertShader from '../../shaders/vert.glsl'

export class Context {
  private gl: WebGL2RenderingContext | undefined
  private aspectRatio = 1
  private programs: { [key: string]: ProgramInfo } = {}
  private started = false
  private instances: Instance[] = []
  private lights: Light[] = []
  private prevTime: number
  private totalTime: number

  public resizeable = true
  public camera: Camera
  public readonly models: ModelCache
  public update: (delta: number) => void | undefined

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

    this.update(deltaTime)

    const uniforms = {
      u_worldInverseTranspose: mat4.create(),
      u_worldViewProjection: mat4.create(),
    } as UniformSet

    const mainProg = this.programs['standard']

    if (this.resizeable) {
      resizeCanvasToDisplaySize(<HTMLCanvasElement>this.gl.canvas)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }

    // Do this in every frame since the window and therefore the aspect ratio of projection matrix might change
    const camView = this.camera.viewMatrix
    const view = mat4.invert(mat4.create(), camView)

    // Add the view inverse to the uniforms, for specular lighting
    uniforms.u_viewInverse = camView

    const projection = this.camera.projectionMatrix(this.aspectRatio)
    const viewProjection = mat4.multiply(mat4.create(), projection, view)

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    this.gl.useProgram(mainProg.program)

    // Since we only have one light, just apply it here
    this.lights[0].apply(mainProg)

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
