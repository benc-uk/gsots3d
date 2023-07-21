// ===== context.ts ===========================================================
// Main rendering context, guts of the library
// Ben Coleman, 2023
// ============================================================================

import { version } from '../../package.json'
import { ProgramInfo, createProgramInfo, resizeCanvasToDisplaySize } from 'twgl.js'
import { mat4, vec3 } from 'gl-matrix'
import log from 'loglevel'

import { getGl, UniformSet } from './gl.ts'
import { RGB, XYZ } from '../engine/tuples.ts'
import { ModelCache } from './cache.ts'
import { LightDirectional, LightPoint } from '../engine/lights.ts'
import { Camera, CameraType } from '../engine/camera.ts'
import { Material } from '../engine/material.ts'
import { BillboardType, Instance } from '../models/instance.ts'
import { Billboard } from '../models/billboard.ts'
import { HUD } from './hud.ts'
import { PrimitiveCube, PrimitivePlane, PrimitiveSphere, PrimitiveCylinder } from '../models/primitive.ts'

// Import shaders, tsup will inline these as text strings
import fragShaderPhong from '../../shaders/phong/glsl.frag'
import vertShaderPhong from '../../shaders/phong/glsl.vert'
import fragShaderFlat from '../../shaders/gouraud-flat/glsl.frag'
import vertShaderFlat from '../../shaders/gouraud-flat/glsl.vert'
import fragShaderBill from '../../shaders/billboard/glsl.frag'
import vertShaderBill from '../../shaders/billboard/glsl.vert'
import { stats } from './stats.ts'

/**
 * The set of supported rendering modes
 */
export enum RenderMode {
  PHONG = 'phong',
  FLAT = 'flat',
}

const MAX_LIGHTS = 16

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
  private billboardProgInfo?: ProgramInfo
  private mainProgInfo?: ProgramInfo

  /** Global directional light */
  public globalLight: LightDirectional

  /** All the dynamic point lights in the scene */
  public lights: LightPoint[] = []

  /** Main camera for this context */
  public readonly camera: Camera

  /** Cache of models, used to create instances */
  public readonly models: ModelCache

  /** Show extra debug details on the canvas */
  public debug = false

  /** The pre-render update hook function */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update: (delta: number) => void = () => {}

  /** A HUD you can use to render HTML elements over the canvas */
  public readonly hud: HUD

  /**
   * Constructor is private, use init() to create a new context
   */
  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.models = new ModelCache()

    // Main global light
    this.globalLight = new LightDirectional()
    this.globalLight.setAsPosition(20, 50, 30)

    this.camera = new Camera(CameraType.PERSPECTIVE)

    this.hud = new HUD(<HTMLCanvasElement>gl.canvas)

    this.debugDiv = document.createElement('div')
    this.debugDiv.classList.add('gsots3d-debug')
    this.hud.addHUDItem(this.debugDiv)

    log.info(`👑 GSOTS-3D context created, v${version}`)
  }

  /**
   * Create & initialize a new Context which will render into provided canvas selector
   */
  static async init(canvasSelector: string, backgroundColour = '#000'): Promise<Context> {
    const gl = getGl(false, canvasSelector)

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
    gl.enable(gl.CULL_FACE)

    gl.enable(gl.BLEND)
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
    if (!this.mainProgInfo || !this.billboardProgInfo) {
      log.error('💥 Missing program info, this is really bad!')
      return
    }

    stats.updateTime(now * 0.001)

    // Call the external update function
    this.update(stats.deltaTime)

    // Do this in every frame since camera can move
    const camMatrix = this.camera.matrix

    // The uniforms that are the same for all instances
    const uniforms = {
      u_worldInverseTranspose: mat4.create(), // Updated per instance
      u_worldViewProjection: mat4.create(), // Updated per instance
      u_view: mat4.invert(mat4.create(), camMatrix),
      u_proj: this.camera.projectionMatrix(this.aspectRatio),
      u_camPos: this.camera.position,
    } as UniformSet

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

    // TODO: Make less lame. Having two lists of instances
    // This is a poor way of pseudo "sorting" the instances so transparent ones are rendered last

    // MAIN LOOP - Draw all opaque instances
    for (const instance of this.instances) {
      if (instance.billboard) {
        instance.render(this.gl, uniforms, this.billboardProgInfo)
      } else {
        instance.render(this.gl, uniforms, this.mainProgInfo)
      }
    }

    // MAIN LOOP - Draw all transparent instances
    for (const instance of this.instancesTrans) {
      if (instance.billboard) {
        instance.render(this.gl, uniforms, this.billboardProgInfo)
      } else {
        instance.render(this.gl, uniforms, this.mainProgInfo)
      }
    }

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

  /**
   * Start the rendering loop
   */
  start() {
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

  resize() {
    resizeCanvasToDisplaySize(<HTMLCanvasElement>this.gl.canvas)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    this.aspectRatio = this.gl.canvas.width / this.gl.canvas.height
  }

  private addInstance(instance: Instance, material: Material) {
    if (material.opacity !== undefined && material.opacity < 1) {
      this.instancesTrans.push(instance)
    } else {
      this.instances.push(instance)
    }
  }

  // ==================================================================================================================

  /**
   * Create a new model instance, which should have been previously loaded into the cache
   * @param modelName - Name of the model previously loaded into the cache
   */
  createModelInstance(modelName: string) {
    const model = this.models.get(modelName)
    if (!model) throw new Error(`💥 Model ${modelName} not found`)

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
    const billboard = new Billboard(this.gl, width, height)

    billboard.material = material

    const instance = new Instance(billboard)
    instance.billboard = type

    this.addInstance(instance, material)

    stats.triangles += 2
    stats.instances++

    // log.debug(`🚧 Created billboard instance with texture: ${textureUrl}`)

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
