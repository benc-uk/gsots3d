// ===== context.ts ===========================================================
// Main rendering context, this is the core of the library
// Ben Coleman, 2023
// ============================================================================

import log from 'loglevel'
import * as CANNON from 'cannon-es'
import * as twgl from 'twgl.js'
import { mat4, vec3 } from 'gl-matrix'

import { version } from '../../package.json'
import { getGl, UniformSet } from './gl.ts'
import { RGB, XYZ, Tuples } from '../engine/tuples.ts'
import { ModelCache, ProgramCache, TextureCache } from './cache.ts'
import { LightDirectional, LightPoint } from '../engine/lights.ts'
import { Camera, CameraType } from '../engine/camera.ts'
import { Material } from '../engine/material.ts'
import { DynamicEnvironmentMap, EnvironmentMap } from '../engine/envmap.ts'
import { Instance } from '../renderable/instance.ts'
import { Billboard, BillboardType } from '../renderable/billboard.ts'
import { PrimitiveCube, PrimitivePlane, PrimitiveSphere, PrimitiveCylinder } from '../renderable/primitive.ts'
import { ParticleSystem } from '../renderable/particles.ts'
import { Model } from '../renderable/model.ts'
import { HUD } from './hud.ts'
import { Stats } from './stats.ts'
import { PostEffects } from '../engine/post-effects.ts'
import { ModelBuilder } from '../renderable/builder.ts'

// Import shaders, tsup will inline these as text strings
import fragShaderPhong from '../../shaders/phong/glsl.frag'
import vertShaderPhong from '../../shaders/phong/glsl.vert'
import fragShaderBill from '../../shaders/billboard/glsl.frag'
import vertShaderBill from '../../shaders/billboard/glsl.vert'

/** @ignore Total max dynamic lights */
const MAX_LIGHTS = 24

/**
 * The main rendering context. This is the effectively main entry point for the library.
 * Typically you will create a single instance of this class using init() and use it to render your scene.
 */
export class Context {
  private gl: WebGL2RenderingContext
  private started: boolean
  private instances: Map<string, Instance> // Keyed on instance id
  private instancesTrans: Map<string, Instance>
  private instancesParticles: Map<string, Instance>
  private cameras: Map<string, Camera>
  private activeCameraName: string
  private _envmap?: EnvironmentMap
  private dynamicEnvMap?: DynamicEnvironmentMap
  private renderPass: number

  /** Global directional light */
  public globalLight: LightDirectional

  /** All the dynamic point lights in the scene */
  public lights: LightPoint[]

  /** Main camera for this context */
  private _camera: Camera

  /** Show extra debug details on the canvas */
  public debug: boolean

  /** Optional post effects filter to apply to the output image */
  private postEffects?: PostEffects

  /**
   * The pre-render update function, called every frame.
   * Hook in your custom logic and processing here
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update: (delta: number, now?: number) => void = () => {}

  /** A HUD you can use to render HTML elements over the canvas */
  public readonly hud: HUD

  /** Gamma correction value, default 1.0 */
  public gamma: number

  /**
   * Integration with cannon-es for physics, set the CANNON.World you are using here.
   * When set, world stepping will be called for you in the core rendering loop
   */
  public physicsWorld?: CANNON.World

  /** Set the fixed time step for physics stepping, only used when physicsWorld is set */
  public physicsTimeStep: number

  /** Backface culling */
  public disableCulling = false

  // ==== Getters =============================================================

  /** Get the active camera */
  get camera() {
    return this._camera
  }

  /** Get the name of the active camera */
  get cameraName() {
    return this.activeCameraName
  }

  /** Get the current EnvironmentMap for the scene */
  get envmap() {
    return this._envmap
  }

  /** Constructor is private, use init() to create a new context */
  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.started = false
    this.debug = false
    this.gamma = 1.0
    this.instances = new Map()
    this.instancesTrans = new Map()
    this.instancesParticles = new Map()
    this.cameras = new Map()
    this.lights = []
    this.renderPass = 0
    this.physicsTimeStep = 1 / 60

    // Main global light
    this.globalLight = new LightDirectional()
    this.globalLight.setAsPosition(20, 50, 30)

    const defaultCamera = new Camera(CameraType.PERSPECTIVE)
    this.cameras.set('default', defaultCamera)
    this._camera = defaultCamera
    this.activeCameraName = 'default'

    this.hud = new HUD(<HTMLCanvasElement>gl.canvas)

    this.setLogLevel('info')

    log.info(`👑 GSOTS-3D context created, v${version}`)
  }

  /**
   * Create & initialize a new Context which will render into provided canvas. This is where you start when using the library.
   * @param canvasSelector CSS selector for canvas element, default is 'canvas'
   * @param antiAlias Enable anti-aliasing in the renderer, default is true
   */
  static async init(canvasSelector = 'canvas', antiAlias = true) {
    const gl = getGl(canvasSelector, antiAlias)

    if (!gl) {
      log.error('💥 Failed to create WebGL context, this is extremely bad news')
      throw new Error('Failed to get WebGL context')
    }

    // Create the context around the WebGL2 context
    const ctx = new Context(gl)

    const canvas = <HTMLCanvasElement>gl.canvas
    ctx.camera.aspectRatio = canvas.clientWidth / canvas.clientHeight

    // Load shaders and put into global cache
    const phongProgInfo = twgl.createProgramInfo(gl, [vertShaderPhong, fragShaderPhong])
    ProgramCache.init(phongProgInfo)
    ProgramCache.instance.add(ProgramCache.PROG_PHONG, phongProgInfo)
    ProgramCache.instance.add(ProgramCache.PROG_BILLBOARD, twgl.createProgramInfo(gl, [vertShaderBill, fragShaderBill]))
    log.info(`🎨 Loaded all shaders & programs, GL is ready`)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Bind to the render function
    ctx.render = ctx.render.bind(ctx)

    // Global texture cache, needs to be initialized after GL context is ready
    TextureCache.init(gl)

    return ctx
  }

  /**
   * Main render loop, called every frame by the context when started
   * @param now Current time in milliseconds
   */
  private async render(now: number) {
    if (!this.gl) return

    Stats.updateTime(now)

    // Move camera before any rendering
    this.camera.update()

    // -----------------------------------------------------------------------
    // RENDER CORE - Render into the dynamic environment map(s) if any
    // -----------------------------------------------------------------------
    if (this.dynamicEnvMap) {
      // This is a rare case of passing the context to the object, but it's needed for the dynamic env map
      this.dynamicEnvMap.update(this.gl, this)
    }

    // -------------------------------------------------------------
    // RENDER CORE - Render the shadow map from the global light
    // -------------------------------------------------------------
    if (this.globalLight.shadowsEnabled) {
      // Switch to front face culling for shadow map, yeah it's weird but it works!
      this.gl.cullFace(this.gl.FRONT)
      this.gl.enable(this.gl.POLYGON_OFFSET_FILL)

      const shadowOpt = this.globalLight.shadowMapOptions
      this.gl.polygonOffset(shadowOpt?.polygonOffset ?? 0, 1)

      // Bind the shadow map framebuffer and render the scene from the light's POV
      // Using the special shadow map program as an override for the whole rendering pass
      twgl.bindFramebufferInfo(this.gl, this.globalLight.shadowMapFrameBufffer)
      const shadowCam = this.globalLight.getShadowCamera(this.camera)

      if (shadowCam) {
        this.addCamera('__shadow', shadowCam)
        this.renderWithCamera(shadowCam, this.globalLight.shadowMapProgram)
      }

      // Switch back to back face culling
      this.gl.cullFace(this.gl.BACK)
      this.gl.disable(this.gl.POLYGON_OFFSET_FILL)
    }

    // -------------------------------------------------------------------------------------
    // RENDER CORE - FINAL: Render the scene from active camera into the main framebuffer
    // -------------------------------------------------------------------------------------
    if (this.postEffects) {
      // Render the main camera view into the post effects framebuffer
      twgl.bindFramebufferInfo(this.gl, this.postEffects.frameBuffer)
      this.renderWithCamera(this.camera)

      // Then render the post effects to the screen
      this.postEffects.renderToScreen(this.gl)
    } else {
      twgl.bindFramebufferInfo(this.gl, null)
      this.renderWithCamera(this.camera)
    }

    // **** FINAL POST RENDER STEPS ****

    this.hud.render(this.debug, this.camera)

    // Call the external update function
    this.update(Stats.deltaTime, now)

    // Advance the physics simulation if configured
    if (this.physicsWorld) {
      this.physicsWorld.step(this.physicsTimeStep, Stats.prevTime)
    }

    // Reset stats for next frame
    Stats.resetPerFrame()
    Stats.frameCount++
    this.renderPass = 0

    // Loop forever or stop if not started
    if (this.started) requestAnimationFrame(this.render)
  }

  /**
   * Render the scene from the given camera, used internally for rendering both the main view,
   * but also shadow maps and dynamic env maps
   * @param camera
   */
  renderWithCamera(camera: Camera, programOverride?: twgl.ProgramInfo) {
    if (!this.gl) return
    this.renderPass++

    // Clear the framebuffer and depth buffer
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    // Do this in every frame since camera can move
    const camMatrix = camera.matrix

    // Work out what reflection map to use, if any
    // NOTE: This *not* part of the material because it's too hard to dynamically change
    let reflectMap: WebGLTexture | null = this._envmap?.texture ?? null

    // As there is only one dynamic reflection envmap, we can use it across all instances
    // But ONLY set this when the camera is NOT rendering into it!
    if (this.dynamicEnvMap) {
      if (!camera.usedForEnvMap) {
        reflectMap = this.dynamicEnvMap.texture
      }
    }

    // The uniforms that are the same for all instances
    const uniforms = {
      u_gamma: this.gamma,

      u_worldInverseTranspose: mat4.create(), // Updated per instance
      u_worldViewProjection: mat4.create(), // Updated per instance
      u_view: mat4.invert(mat4.create(), camMatrix),
      u_proj: camera.projectionMatrix,
      u_camPos: camera.position,

      u_reflectionMap: reflectMap,

      u_shadowMap: this.globalLight.shadowMapTexture,
      u_shadowMatrix: this.globalLight.getShadowMatrix(this.camera) ?? mat4.create(),
    } as UniformSet

    // ------------------------------------------------------------------------------
    // RENDER CORE - Draw envmap around the scene first, as a skybox background
    // ------------------------------------------------------------------------------
    if (this._envmap) {
      this._envmap.render(<mat4>uniforms.u_view, <mat4>uniforms.u_proj, camera)
    }

    // ------------------------------------------------
    // RENDER CORE - Process lighting
    // ------------------------------------------------

    // Apply global light to the two programs
    uniforms.u_lightDirGlobal = this.globalLight.uniforms

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

    // ------------------------------------------------
    // RENDER CORE - Draw all standard opaque instances
    // ------------------------------------------------
    if (this.disableCulling) this.gl.disable(this.gl.CULL_FACE)
    else this.gl.enable(this.gl.CULL_FACE)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_id, instance] of this.instances) {
      instance.render(this.gl, uniforms, programOverride)

      // Update physics body position from instance only on first render pass
      if (this.renderPass == 1) instance.updateFromPhysicsBody()
    }

    // ------------------------------------------------
    // RENDER CORE - Draw all transparent instances
    // ------------------------------------------------

    // Sort transparent instances by distance to camera
    // TODO: Maybe remove this in scenes with lots of transparent instances?
    const instancesTransArray = Array.from(this.instancesTrans.values())
    instancesTransArray.sort((a, b) => {
      const ad = Tuples.distance(a.position ?? [0, 0, 0], this.camera.position)
      const bd = Tuples.distance(b.position ?? [0, 0, 0], this.camera.position)
      return bd - ad
    })

    this.gl.disable(this.gl.CULL_FACE)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const instance of instancesTransArray) {
      instance.render(this.gl, uniforms, programOverride)

      // Update physics body position from instance only on first render pass
      if (this.renderPass == 1) instance.updateFromPhysicsBody()
    }

    // ------------------------------------------------
    // RENDER CORE - Draw all particle systems
    // ------------------------------------------------
    this.gl.depthMask(false)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_id, instance] of this.instancesParticles) {
      instance.render(this.gl, uniforms, programOverride)
    }

    this.gl.depthMask(true)
  }

  /**
   * Start the rendering loop, without calling this nothing will render
   */
  start() {
    log.info('🚀 Starting main GSOTS render loop!')

    this.hud.hideLoading()
    this.started = true
    // Restart the render loop
    requestAnimationFrame(this.render)
  }

  /**
   * Stop the rendering loop
   */
  stop() {
    log.info('🛑 Stopping main GSOTS render loop')

    this.started = false
  }

  /**
   * Set the log level for the library
   * @param level - Log level to set, default is 'info'
   */
  setLogLevel(level: log.LogLevelNames) {
    log.setLevel(level)
  }

  /**
   * Resize the canvas & viewport to match the size of the HTML element that contains it
   * @param viewportOnly - Only resize the GL viewport, not the canvas, default false
   */
  resize(viewportOnly = false) {
    const canvas = <HTMLCanvasElement>this.gl.canvas

    if (!viewportOnly) twgl.resizeCanvasToDisplaySize(canvas)

    this.gl.viewport(0, 0, canvas.width, canvas.height)
    this.camera.aspectRatio = canvas.width / canvas.height

    log.info(
      `📐 RESIZE Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`,
    )
  }

  /**
   * Internal function to add an instance to the scene
   */
  private addInstance(instance: Instance, material: Material) {
    if (material.opacity !== undefined && material.opacity < 1) {
      this.instancesTrans.set(instance.id, instance)
    } else {
      this.instances.set(instance.id, instance)
    }
  }

  /**
   * Model loader, loads an OBJ model from a file via URL or path and adds it to the cache
   * This is preferred over calling Model.parse() directly
   * @param path Base path to the model file, e.g. './renderable/'
   * @param fileName Name of the model file, e.g 'teapot.obj'
   * @param filterTextures Apply texture filtering as materials are loaded
   * @param flipTextureY Flip the Y coordinate of the texture
   */
  async loadModel(path: string, fileName: string, filterTextures = true, flipY = false, flipUV = true) {
    const modelName = fileName.split('.')[0]

    // Check if model is already loaded
    if (ModelCache.instance.get(modelName, false)) {
      log.warn(`⚠️ Model '${modelName}' already loaded, skipping`)
      return
    }

    // Load the model and always flip the UV
    const model = await Model.parse(path, fileName, filterTextures, flipY, flipUV)

    ModelCache.instance.add(model)
  }

  /**
   * Add or replace a named camera to the scene
   * @param name Name of the camera
   * @param camera Camera instance
   */
  addCamera(name: string, camera: Camera) {
    this.cameras.set(name, camera)
  }

  /**
   * Get a camera by name
   * @param name Name of the camera
   */
  getCamera(name: string) {
    return this.cameras.get(name)
  }

  /**
   * Set the active camera, rendering will switch to this camera's view
   * @param name Name of the camera to set as active
   */
  setActiveCamera(name: string) {
    if (name == this.activeCameraName) return

    const camera = this.cameras.get(name)
    if (!camera) {
      throw new Error(`💥 Unable to set active camera to '${name}', camera not found`)
    }

    this.camera.active = false
    this._camera = camera
    this.camera.active = true
    this.activeCameraName = name

    log.info(`📷 Active camera switched to '${name}'`)
  }

  // ==========================================================================
  // Methods to create new instances of renderable objects & things
  // ==========================================================================

  /**
   * Create a new model instance, which should have been previously loaded into the cache
   * @param modelName - Name of the model previously loaded into the cache, don't include the file extension
   */
  createModelInstance(modelName: string) {
    const model = ModelCache.instance.get(modelName)
    if (!model) {
      throw new Error(`💥 Unable to create model instance for ${modelName}`)
    }

    const instance = new Instance(model)
    this.instances.set(instance.id, instance)
    Stats.triangles += model.triangleCount
    Stats.instances++

    return instance
  }

  /**
   * Create an instance of a primitive sphere
   * @param material - Material to apply to the sphere
   * @param radius - Radius of the sphere
   * @param subdivisionsH - Number of subdivisions along the horizontal
   * @param subdivisionsV - Number of subdivisions along the vertical
   */
  createSphereInstance(material: Material, radius = 5, subdivisionsH = 16, subdivisionsV = 8) {
    const sphere = new PrimitiveSphere(this.gl, radius, subdivisionsH, subdivisionsV)
    sphere.material = material

    const instance = new Instance(sphere)
    this.addInstance(instance, material)
    Stats.triangles += sphere.triangleCount
    Stats.instances++

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
    Stats.triangles += plane.triangleCount
    Stats.instances++

    log.debug(`🟨 Created plane instance, w:${width} h:${height}`)

    return instance
  }

  /**
   * Create an instance of a primitive cube
   */
  createCubeInstance(material: Material, size = 5, tilingFactor?: number) {
    const cube = new PrimitiveCube(this.gl, size, tilingFactor)
    cube.material = material

    const instance = new Instance(cube)
    this.addInstance(instance, material)
    Stats.triangles += cube.triangleCount
    Stats.instances++

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
    Stats.triangles += cyl.triangleCount
    Stats.instances++

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
  createBillboardInstance(material: Material, size = 5, type = BillboardType.CYLINDRICAL) {
    const billboard = new Billboard(this.gl, type, material, size)

    const instance = new Instance(billboard)

    this.addInstance(instance, material)

    Stats.triangles += 2
    Stats.instances++

    log.debug(`🚧 Created billboard instance of type: ${type} size: ${size}`)

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

  /**
   * Create a new particle system in the scene
   * @param maxParticles Maximum number of particles to allow in the system
   * @param baseSize Base size of the particles, default 2
   * @returns Both the instance and the particle system
   */
  createParticleSystem(maxParticles = 1000, baseSize = 2) {
    const particleSystem = new ParticleSystem(this.gl, maxParticles, baseSize)

    const instance = new Instance(particleSystem)
    instance.castShadow = false

    this.instancesParticles.set(instance.id, instance)
    Stats.instances++

    log.debug(`✨ Created particle system`)

    return { instance, particleSystem }
  }

  /**
   * Set the EnvironmentMap for the scene, will overwrite any existing envmap.
   * This will enable static reflections and create a 'skybox' around the scene
   * @param textureURLs - Array of 6 texture URLs to use for the map, in the order: +X, -X, +Y, -Y, +Z, -Z
   */
  setEnvmap(renderAsBackground = false, ...textureURLs: string[]) {
    this._envmap = new EnvironmentMap(this.gl, textureURLs)
    this._envmap.renderAsBackground = renderAsBackground
  }

  /**
   * Remove any current EnvironmentMap from the scene
   */
  removeEnvmap() {
    this._envmap = undefined
  }

  /**
   * Set and create a dynamic environment map which will enable dynamic/realtime reflections
   * @param position - Position to render reflections from
   * @param size - Size of the map to render, note higher sizes will come with a big performance hit
   */
  setDynamicEnvmap(position: XYZ, size = 256, renderDistance = 500) {
    this.dynamicEnvMap = new DynamicEnvironmentMap(this.gl, size, position, renderDistance)
  }

  /**
   * Remove instance from the scene, it will no longer be rendered
   * @param instance - Instance to remove
   */
  removeInstance(instance: Instance) {
    if (!instance) return

    if (instance.renderable instanceof ParticleSystem) {
      this.instancesParticles.delete(instance.id)
      return
    }

    this.instances.delete(instance.id)
    this.instancesTrans.delete(instance.id)
  }

  /**
   * Remove all instances from the scene
   */
  removeAllInstances() {
    this.instances.clear()
    this.instancesTrans.clear()
    this.instancesParticles.clear()
  }

  /**
   * Use a custom shader for post effects, user must provide their own shader
   * @param shaderCode - GLSL shader code for the post effect
   */
  setEffectCustom(shaderCode: string) {
    this.postEffects = new PostEffects(this.gl, shaderCode)
    log.info(`🌈 Post effects shader added`)
  }

  /**
   * Use bulit-in scanlines post effect shader
   * @param density - Density of the scanlines, default 1.5
   * @param opacity - Opacity of the scanlines, default 0.5
   * @param noise - Noise level, default 0.2
   * @param flicker - Flicker ammount, default 0.015
   */
  setEffectScanlines(density = 1.5, opacity = 0.5, noise = 0.2, flicker = 0.015) {
    this.postEffects = PostEffects.scanlines(this.gl, density, opacity, noise, flicker)

    log.info(`🌈 Post effects scanline shader added`)
  }

  /**
   * Use bulit-in glitch post effect shader
   * @param amount - Amount of glitch, default 0.01
   */
  setEffectGlitch(amount = 0.01) {
    this.postEffects = PostEffects.glitch(this.gl, amount)

    log.info(`🌈 Post effects glitch shader added`)
  }

  /**
   * Use bulit-in noise post effect shader
   * @param amount - Amount of noise, default 0.1
   * @param speed - Speed of noise pattern, default 5.0
   */
  setEffectNoise(amount = 0.2, speed = 5.0) {
    this.postEffects = PostEffects.noise(this.gl, amount, speed)

    log.info(`🌈 Post effects noise shader added`)
  }

  /**
   * Use bulit-in duotone post effect shader for monotone images
   * @param colour1 - First colour, default [0.15, 0.09, 0.309]
   * @param colour2 - Second colour, default [0.96, 0.39, 0.407]
   * @param contrast - Contrast, default 1.5
   */
  setEffectDuotone(colour1: RGB = [0.15, 0.09, 0.309], colour2: RGB = [0.96, 0.39, 0.407], contrast = 1.5) {
    this.postEffects = PostEffects.duotone(this.gl, colour1, colour2, contrast)

    log.info(`🌈 Post effects monochrome shader added`)
  }

  /**
   * Use bulit-in contrast post effect shader, which reduces the image to two solid colours
   * @param threshold
   * @param darkColour
   * @param lightColour
   */
  setEffectContrast(threshold = 0.2, darkColour: RGB = [0, 0, 0], lightColour: RGB = [1, 1, 1]) {
    this.postEffects = PostEffects.contrast(this.gl, threshold, darkColour, lightColour)

    log.info(`🌈 Post effects monochrome shader added`)
  }

  /**
   * Remove any post effects shader
   */
  removeEffect() {
    this.postEffects = undefined
  }

  /**
   * Create and build a custom model from a ModelBuilder and cache it for use
   * @param builder Builder with geometry and materials added
   * @param name Name of the model
   */
  buildCustomModel(builder: ModelBuilder, name: string) {
    const model = Model.parseFromBuilder(builder, name)

    log.info(`🔨 Custom model built and added to cache`)

    ModelCache.instance.add(model)
  }
}
