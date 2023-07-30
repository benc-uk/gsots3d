// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import { version } from '../../package.json'
import {
  FramebufferInfo,
  ProgramInfo,
  bindFramebufferInfo,
  createFramebufferInfo,
  createProgramInfo,
  resizeCanvasToDisplaySize,
} from 'twgl.js'
import { mat4, vec3 } from 'gl-matrix'
import log from 'loglevel'

import { getGl, UniformSet } from './gl.ts'
import { RGB, XYZ, Tuples } from '../engine/tuples.ts'
import { ModelCache, TextureCache } from './cache.ts'
import { LightDirectional, LightPoint } from '../engine/lights.ts'
import { Camera, CameraType } from '../engine/camera.ts'
import { Material } from '../engine/material.ts'
import { BillboardType, Instance } from '../models/instance.ts'
import { Billboard } from '../models/billboard.ts'
import { PrimitiveCube, PrimitivePlane, PrimitiveSphere, PrimitiveCylinder } from '../models/primitive.ts'
import { Model } from '../models/model.ts'
import { HUD } from './hud.ts'
import { stats } from './stats.ts'

// Import shaders, tsup will inline these as text strings
import fragShaderPhong from '../../shaders/phong/glsl.frag'
import vertShaderPhong from '../../shaders/phong/glsl.vert'
import fragShaderFlat from '../../shaders/gouraud-flat/glsl.frag'
import vertShaderFlat from '../../shaders/gouraud-flat/glsl.vert'
import fragShaderBill from '../../shaders/billboard/glsl.frag'
import vertShaderBill from '../../shaders/billboard/glsl.vert'

// HACK: REMOVE THIS
let fbi: FramebufferInfo

/**
 * The set of supported rendering modes
 */
export enum RenderMode {
  PHONG = 'phong',
  FLAT = 'flat',
}

/** @ignore Total max dynamic lights */
const MAX_LIGHTS = 16

/** @ignore Global singleton texture cache */
export let textureCache: TextureCache

/**
 * The main rendering context. This is the effectively main entry point for the library.
 * Typically you will create a single instance of this class using init() and use it to render your scene.
 */
export class Context {
  private gl: WebGL2RenderingContext
  private aspectRatio = 1
  private programs: Map<string, ProgramInfo> = new Map()
  private started = false
  private instances: Instance[] = []
  private instancesTrans: Instance[] = []
  private debugDiv: HTMLDivElement
  private loadingDiv: HTMLDivElement
  private billboardProgInfo?: ProgramInfo
  private mainProgInfo?: ProgramInfo
  private models: ModelCache
  private cameras: Map<string, Camera> = new Map()
  private activeCameraName: string

  /** Global directional light */
  public globalLight: LightDirectional

  /** All the dynamic point lights in the scene */
  public lights: LightPoint[] = []

  /** Main camera for this context */
  private _camera: Camera

  /** Show extra debug details on the canvas */
  public debug = false

  /**
   * The pre-render update function, called every frame.
   * Hook in your custom logic and processing here
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update: (delta: number) => void = () => {}

  /** A HUD you can use to render HTML elements over the canvas */
  public readonly hud: HUD

  /** Gamma correction value, default 1.0 */
  public gamma: number

  // ==== Getters =============================================================

  get camera() {
    return this._camera
  }

  get cameraName() {
    return this.activeCameraName
  }

  /**
   * Constructor is private, use init() to create a new context
   */
  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()

    // Main global light
    this.globalLight = new LightDirectional()
    this.globalLight.setAsPosition(20, 50, 30)

    // Default camera, named erm, 'default' :)
    const defaultCamera = new Camera(CameraType.PERSPECTIVE)
    this.cameras.set('default', defaultCamera)
    this._camera = defaultCamera
    this.activeCameraName = 'default'

    this.gamma = 1.0

    this.hud = new HUD(<HTMLCanvasElement>gl.canvas)

    this.debugDiv = document.createElement('div')
    this.debugDiv.classList.add('gsots3d-debug')
    this.debugDiv.style.fontSize = 'min(1.5vw, 20px)'
    this.debugDiv.style.fontFamily = 'monospace'
    this.debugDiv.style.color = 'white'
    this.debugDiv.style.padding = '1vw'
    this.hud.addHUDItem(this.debugDiv)

    this.loadingDiv = document.createElement('div')
    this.loadingDiv.classList.add('gsots3d-loading')
    this.loadingDiv.innerHTML = '💾 Loading...'
    this.loadingDiv.style.font = 'normal 4vw sans-serif'
    this.loadingDiv.style.color = 'white'
    this.loadingDiv.style.position = 'absolute'
    this.loadingDiv.style.top = '50%'
    this.loadingDiv.style.left = '50%'
    this.loadingDiv.style.transform = 'translate(-50%, -50%)'
    this.hud.addHUDItem(this.loadingDiv)

    log.info(`👑 GSOTS-3D context created, v${version}`)
  }

  /**
   * Create & initialize a new Context which will render into provided canvas selector
   */
  static async init(canvasSelector = 'canvas', antiAlias = true): Promise<Context> {
    const gl = getGl(antiAlias, canvasSelector)

    if (!gl) {
      log.error('💥 Failed to get WebGL context, this is extremely bad news')
      throw new Error('Failed to get WebGL context')
    }

    // Create the context around the WebGL2 context
    const ctx = new Context(gl)

    const canvas = <HTMLCanvasElement>gl.canvas
    ctx.aspectRatio = canvas.clientWidth / canvas.clientHeight

    // Load shaders and build map of programs
    try {
      const phongProg = createProgramInfo(gl, [vertShaderPhong, fragShaderPhong])
      ctx.programs.set(RenderMode.PHONG, phongProg)

      const flatProg = createProgramInfo(gl, [vertShaderFlat, fragShaderFlat])
      ctx.programs.set(RenderMode.FLAT, flatProg)

      // Special program for billboards, which are rendered differently
      const billboardProg = createProgramInfo(gl, [vertShaderBill, fragShaderBill])

      ctx.billboardProgInfo = billboardProg
      ctx.mainProgInfo = phongProg

      log.info(`🎨 Loaded all shaders & programs, GL is ready`)
    } catch (err) {
      log.error(err)
      throw err
    }

    gl.enable(gl.DEPTH_TEST)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // bind to the render function
    ctx.render = ctx.render.bind(ctx)

    // Global texture cache
    textureCache = new TextureCache(gl)

    // HACK: REMOVE THIS
    fbi = createFramebufferInfo(gl, [{}], 256, 256)

    return ctx
  }

  /**
   * Main render loop, called every frame
   */
  private async render(now: number) {
    if (!this.gl) return
    if (!this.mainProgInfo || !this.billboardProgInfo) {
      log.error('💥 Missing program info, this is really bad!')
      return
    }

    stats.updateTime(now * 0.001)

    // Call the external update function
    this.update(stats.deltaTime)

    bindFramebufferInfo(this.gl, fbi)
    this.renderWithCamera(this.camera)

    bindFramebufferInfo(this.gl, null)
    this.renderWithCamera(this.camera, true)

    // Draw the debug HUD
    if (this.debug) {
      this.debugDiv.innerHTML = `
        <b>GSOTS-3D v${version}</b><br><br>
        <b>Camera: </b>${this.camera.toString()}<br>
        <b>Instances: </b>${stats.instances}<br>
        <b>Draw calls: </b>${stats.drawCallsPerFrame}<br>
        <b>Triangles: </b>${stats.triangles}<br>
        <b>Render: </b>FPS: ${stats.FPS} / ${stats.totalTimeRound}s<br>
      `
    } else {
      this.debugDiv.innerHTML = ''
    }

    // Loop forever or stop if not started
    if (this.started) requestAnimationFrame(this.render)

    // Reset stats for next frame
    stats.resetPerFrame()
  }

  renderWithCamera(camera: Camera, blah = false) {
    if (!this.gl) return
    if (!this.mainProgInfo || !this.billboardProgInfo) {
      log.error('💥 Missing program info, this is really bad!')
      return
    }

    // Update the camera
    camera.update()

    // Do this in every frame since camera can move
    const camMatrix = camera.matrix

    // The uniforms that are the same for all instances
    const uniforms = {
      u_gamma: this.gamma ?? 1.0,
      u_worldInverseTranspose: mat4.create(), // Updated per instance
      u_worldViewProjection: mat4.create(), // Updated per instance
      u_view: mat4.invert(mat4.create(), camMatrix),
      u_proj: camera.projectionMatrix(this.aspectRatio),
      u_camPos: camera.position,
    } as UniformSet

    // HACK: REMOVE THIS
    if (blah) {
      uniforms.u_fbi = fbi.attachments[0]
    } else {
      uniforms.u_fbi = null
    }

    // Apply global light to the two programs
    this.gl.useProgram(this.billboardProgInfo.program)
    this.globalLight.apply(this.billboardProgInfo, 'Global')
    this.gl.useProgram(this.mainProgInfo.program)
    this.globalLight.apply(this.mainProgInfo, 'Global')

    // Only sort lights if we have more than MAX_LIGHTS, it's expensive!
    if (this.lights.length > MAX_LIGHTS) {
      // Sort lights by distance to camera so we can use the closest ones
      this.lights.sort((lightA, lightB) => {
        const ad = vec3.distance(lightA.position, this.camera.position)
        const bd = vec3.distance(lightB.position, this.camera.position)
        return ad - bd
      })
    }

    // Add the point lights into u_lightsPos array up to MAX_LIGHTS
    let lightCount = 0
    for (const light of this.lights) {
      if (lightCount >= MAX_LIGHTS) break
      if (!light.enabled) continue

      uniforms[`u_lightsPos[${lightCount++}]`] = light.uniforms
    }

    uniforms.u_lightsPosCount = lightCount

    // MAIN LOOP - Draw all opaque instances
    this.gl.enable(this.gl.CULL_FACE)
    uniforms.u_special = 0
    for (const instance of this.instances) {
      if (instance.billboard) {
        instance.render(this.gl, uniforms, this.billboardProgInfo)
      } else {
        // HACK: REMOVE THIS
        if (instance.position && instance.position[0] === 7) {
          uniforms.u_special = 1
        }
        instance.render(this.gl, uniforms, this.mainProgInfo)
      }
    }

    // MAIN LOOP - Draw all transparent instances
    this.gl.disable(this.gl.CULL_FACE)

    // Sort transparent instances by distance to camera
    // Maybe remove this in scenes with lots of transparent instances?
    this.instancesTrans.sort((a, b) => {
      const ad = Tuples.distance(a.position ?? [0, 0, 0], this.camera.position)
      const bd = Tuples.distance(b.position ?? [0, 0, 0], this.camera.position)
      return bd - ad
    })

    for (const instance of this.instancesTrans) {
      if (instance.billboard) {
        instance.render(this.gl, uniforms, this.billboardProgInfo)
      } else {
        instance.render(this.gl, uniforms, this.mainProgInfo)
      }
    }
  }

  /**
   * Start the rendering loop
   */
  start() {
    this.loadingDiv.style.display = 'none'
    this.started = true
    // Restart the render loop
    requestAnimationFrame(this.render)
  }

  /**
   * Stop the rendering loop
   */
  stop() {
    this.started = false
  }

  /**
   * Change the render mode, e.g. Phong or Flat
   * @param mode - Set the render mode to one of the available sets
   */
  setRenderMode(mode: RenderMode) {
    if (!this.programs.has(mode)) {
      throw new Error(`💥 Render mode '${mode}' is not valid, you will have a bad time 💩`)
    }

    this.mainProgInfo = this.programs.get(mode)
  }

  /**
   * Resize the canvas to match the size of the element it's in
   * @param viewportOnly - Only resize the viewport, not the canvas
   */
  resize(viewportOnly = false) {
    const canvas = <HTMLCanvasElement>this.gl.canvas

    if (!viewportOnly) resizeCanvasToDisplaySize(canvas)

    this.gl.viewport(0, 0, canvas.width, canvas.height)
    this.aspectRatio = canvas.width / canvas.height

    log.info(
      `📐 RESIZE Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`
    )
  }

  /**
   * Internal function to add an instance to the scene
   */
  private addInstance(instance: Instance, material: Material) {
    if (material.opacity !== undefined && material.opacity < 1) {
      this.instancesTrans.push(instance)
    } else {
      this.instances.push(instance)
    }
  }

  /**
   * Model loader, loads a model from a file and adds it to the cache
   * This is preferred over calling Model.parse() directly
   * @param path Base path to the model file, e.g. './models/'
   * @param fileName Name of the model file, e.g 'teapot.obj'
   */
  public async loadModel(path: string, fileName: string, filter = true, flipY = true) {
    const modelName = fileName.split('.')[0]

    // Check if model is already loaded
    if (this.models.get(modelName, false)) {
      log.warn(`⚠️ Model '${modelName}' already loaded, skipping`)
      return
    }

    const model = await Model.parse(path, fileName, filter, flipY)

    this.models.add(model)
  }

  /**
   * Add a new camera to the scene
   * @param name Name of the camera
   * @param camera Camera instance
   */
  public addCamera(name: string, camera: Camera) {
    this.cameras.set(name, camera)
  }

  public getCamera(name: string) {
    return this.cameras.get(name)
  }

  /**
   * Set the active camera
   * @param name Name of the camera to set as active
   */
  public setActiveCamera(name: string) {
    const camera = this.cameras.get(name)
    if (!camera) {
      throw new Error(`💥 Unable to set active camera to '${name}', camera not found`)
    }

    this.camera.active = false
    this._camera = camera
    this.camera.active = true
    this.activeCameraName = name
  }

  // ==========================================================================
  // Methods to create new instances of renderable objects & things
  // ==========================================================================

  /**
   * Create a new model instance, which should have been previously loaded into the cache
   * @param modelName - Name of the model previously loaded into the cache, don't include the file extension
   */
  createModelInstance(modelName: string) {
    const model = this.models.get(modelName)
    if (!model) {
      throw new Error(`💥 Unable to create model instance for ${modelName}`)
    }

    const instance = new Instance(model)
    this.instances.push(instance)
    stats.triangles += model.triangleCount
    stats.instances++

    return instance
  }

  /**
   * Create an instance of a primitive sphere
   */
  createSphereInstance(material: Material, radius = 5, subdivisionsH = 16, subdivisionsV = 8) {
    const sphere = new PrimitiveSphere(this.gl, radius, subdivisionsH, subdivisionsV)
    sphere.material = material

    const instance = new Instance(sphere)
    this.addInstance(instance, material)
    stats.triangles += sphere.triangleCount
    stats.instances++

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
    this.addInstance(instance, material)
    stats.triangles += plane.triangleCount
    stats.instances++

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
    this.addInstance(instance, material)
    stats.triangles += cube.triangleCount
    stats.instances++

    log.debug(`📦 Created cube instance, size:${size}`)

    return instance
  }

  /**
   * Create an instance of a primitive cylinder
   */
  createCylinderInstance(material: Material, r = 2, h = 5, subdivisionsR = 16, subdivisionsH = 1, caps = true) {
    const cyl = new PrimitiveCylinder(this.gl, r, h, subdivisionsR, subdivisionsH, caps)
    cyl.material = material

    const instance = new Instance(cyl)
    this.addInstance(instance, material)
    stats.triangles += cyl.triangleCount
    stats.instances++

    log.debug(`🛢️ Created cylinder instance, r:${r}`)

    return instance
  }

  /**
   * Create an instance of a billboard/sprite in the scene
   * @param textureUrl - Path to the texture image file to use for the billboard
   * @param width - Width of the billboard (default: 5)
   * @param height - Height of the billboard (default: 5)
   * @param type - Type of billboard to create (default: CYLINDRICAL)
   */
  createBillboardInstance(material: Material, width = 5, height = 5, type = BillboardType.CYLINDRICAL) {
    const billboard = new Billboard(this.gl, material, width)

    const instance = new Instance(billboard)
    instance.billboard = type

    this.addInstance(instance, material)

    stats.triangles += 2
    stats.instances++

    log.debug(`🚧 Created billboard instance of type: ${type} ${height}`)

    return instance
  }

  /**
   * Create a new point light in the scene
   * @param position - Position of the light
   * @param colour - Colour of the light, defaults to white
   * @param intensity - Intensity of the light
   * @returns The new light object
   */
  createPointLight(position: XYZ, colour: RGB = [1, 1, 1], intensity = 1) {
    const light = new LightPoint(position, colour)
    light.position = position
    light.colour = colour

    // A very simple scaling of the light attenuation
    // Users can still set the attenuation manually if they want
    light.constant /= intensity
    light.linear /= intensity
    light.quad /= intensity

    this.lights.push(light)

    log.debug(`🔆 Created point light, pos:${position} col:${colour} int:${intensity}`)

    return light
  }
}
