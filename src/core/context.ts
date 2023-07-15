// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import { version } from '../../package.json'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { mat4 } from 'gl-matrix'
import log from 'loglevel'

import { getGl } from './gl.ts'
import { UniformSet } from './types.ts'
import { ModelCache } from '../models/cache.ts'
import { LightDirectional, LightPoint } from '../render/lights.ts'
import { Camera, CameraType } from '../render/camera.ts'
import { Material } from '../render/material.ts'
import { Instance } from '../models/instance.ts'
import { HUD } from './hud.ts'
import { PrimitiveCube, PrimitivePlane, PrimitiveSphere, PrimitiveCylinder } from '../models/primitive.ts'

// Import shaders, tsup will inline these as text strings
import fragShaderPhong from '../../shaders/phong/glsl.frag'
import vertShaderPhong from '../../shaders/phong/glsl.vert'
import fragShaderFlat from '../../shaders/gouraud-flat/glsl.frag'
import vertShaderFlat from '../../shaders/gouraud-flat/glsl.vert'

/**
 * The set of supported shader programs that can be used
 */
export enum ShaderProgram {
  PHONG = 'phong',
  FLAT = 'flat',
}

/**
 * The main rendering context. This is the effectively main entry point for the library.
 * Typically you will create a single instance of this class using init() and use it to render your scene.
 */
export class Context {
  private gl: WebGL2RenderingContext
  private aspectRatio = 1
  private programs: Map<ShaderProgram, ProgramInfo> = new Map()
  private started = false
  private instances: Instance[] = []
  private prevTime: number
  private totalTime: number
  private debugDiv: HTMLDivElement
  public lights: LightPoint[] = []

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

  /** Global directional light */
  public globalLight: LightDirectional

  /**
   * Constructor is private, use init() to create a new context
   */
  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()
    this.prevTime = 0
    this.totalTime = 0

    // Main global light
    this.globalLight = new LightDirectional()
    this.globalLight.setAsPosition(20, 50, 30)

    this.camera = new Camera(CameraType.PERSPECTIVE)

    this.update = () => {
      // Placeholder empty update function
    }

    this.hud = new HUD(<HTMLCanvasElement>gl.canvas)

    this.debugDiv = document.createElement('div')
    this.debugDiv.classList.add('gsots3d-debug')
    this.debugDiv.style.padding = '15px'
    this.hud.addHUDItem(this.debugDiv)

    // TODO: Left for reference related to flat shading
    // const epv = gl.getExtension('WEBGL_provoking_vertex')
    // if (epv) {
    //   epv.provokingVertexWEBGL(epv.FIRST_VERTEX_CONVENTION_WEBGL)
    // }

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

    // Load shaders and build map of programs
    try {
      const phongProg = createProgramInfo(gl, [vertShaderPhong, fragShaderPhong])
      ctx.programs.set(ShaderProgram.PHONG, phongProg)

      const flatProg = createProgramInfo(gl, [vertShaderFlat, fragShaderFlat])
      ctx.programs.set(ShaderProgram.FLAT, flatProg)

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
      u_lightAmbientGlobal: this.ambientLight,
      u_camPos: this.camera.position,
    } as UniformSet

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

    const shaderProg = this.programs.get(this.shaderProgram)
    if (shaderProg === undefined) {
      throw new Error(`💥Shader program ${this.shaderProgram} is not valid!`)
    }

    this.gl.useProgram(shaderProg.program)

    // Since we only have one light, just apply it here
    this.globalLight.apply(shaderProg, 'Global')

    // Add the rest of u_lights is the closest lights up to MAX_LIGHTS
    let lightCount = 0
    for (const light of this.lights) {
      if (lightCount > 16) break
      uniforms[`u_lightsPos[${lightCount++}]`] = light.uniforms
    }

    uniforms.u_lightsPosCount = lightCount

    // log.debug(uniforms)

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
    } else {
      this.debugDiv.innerHTML = ''
    }

    // Loop forever or not
    if (this.started) requestAnimationFrame(this.render)
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
   * @param material - Material to apply to the plane
   * @param width - Width of the plane
   * @param height - Height of the plane
   * @param subdivisionsW - Number of subdivisions along the width
   * @param subdivisionsH - Number of subdivisions along the height
   * @param tiling - Number of times to tile the texture over the plane
   */
  createPlaneInstance(material: Material, width = 5, height = 5, subdivisionsW = 1, subdivisionsH = 1, tiling = 1) {
    const plane = new PrimitivePlane(this.gl, width, height, subdivisionsW, subdivisionsH, tiling)
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

  /**
   * Create an instance of a primitive cylinder
   */
  createCylinderInstance(material: Material, r = 2, h = 5, subdivisionsR = 16, subdivisionsH = 1, caps = true) {
    const cube = new PrimitiveCylinder(this.gl, r, h, subdivisionsR, subdivisionsH, caps)
    cube.material = material

    const instance = new Instance(cube)
    this.instances.push(instance)

    log.debug(`🛢️ Created cylinder instance, r:${r}`)

    return instance
  }
}
