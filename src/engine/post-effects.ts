// ===== post-effects.ts ===============================================================================
// Full screen effects and post processing
// Ben Coleman, 2023
// =============================================================================================

import * as log from 'loglevel'
import * as twgl from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { TextureCache } from '../core/cache.ts'
import { Stats } from '../core/stats.ts'
import { RGB } from './tuples.ts'

/**
 * PostEffects class, used to render full screen effects via post processing
 * This is a wrapper around a shader program that renders from a framebuffer to the screen
 */
export class PostEffects {
  private _frameBuff: twgl.FramebufferInfo
  private buffInfo: twgl.BufferInfo
  private uniforms: UniformSet
  private progInfo: twgl.ProgramInfo

  constructor(gl: WebGL2RenderingContext, shaderCode: string) {
    // Create a framebuffer to hold image for this post effects to process
    this._frameBuff = twgl.createFramebufferInfo(gl, undefined, gl.canvas.width, gl.canvas.height)

    // Simple 2-triangle quad for a shader to render to the whole screen
    this.buffInfo = twgl.createBufferInfoFromArrays(gl, {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
      },
      texcoord: {
        numComponents: 2,
        data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1],
      },
    })

    this.uniforms = {
      image: this._frameBuff.attachments[0],
      width: gl.canvas.width,
      height: gl.canvas.height,
      time: Stats.totalTime,
      delta: Stats.deltaTime,
      randTex: TextureCache.defaultRand,
    }

    // Note. We don't follow the naming convention from the other shaders here
    // to allow the user to write their own shaders and keep them simple
    const vertShader = `#version 300 es
    precision highp float;
    in vec4 position;
    in vec2 texcoord;
    out vec2 pos;
    void main() {
      pos = texcoord;
      gl_Position = position;
    }`

    const fragShader = `#version 300 es
    precision highp float;
    in vec2 pos;
    uniform sampler2D image;
    uniform float width;
    uniform float height;
    uniform float time;
    uniform float frame;
    uniform float delta;
    uniform sampler2D randTex;
    out vec4 pixel;
    
    vec4 randRGBA(float offset) {
      vec2 uv = vec2(pos.x + offset, pos.y + offset + 0.1);
      return texture(randTex, vec2(uv)).rgba;
    }
    
    float randPhase(vec2 co, float speed)
    {
      float a = 12.9898;
      float b = 78.233;
      float c = 43758.5453;
      float dt = dot(co.xy, vec2(a,b));
      float sn = mod(dt, 3.14159);

      return fract((sin(sn) * c) + time * speed);
    }

    float randF(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    } 

    ${shaderCode}
    `

    log.debug(`🥽 PostEffects creating shader program\n${fragShader}`)
    this.progInfo = twgl.createProgramInfo(gl, [vertShader, fragShader])
  }

  /**
   * Render the post effects to the screen, called last in the render loop
   * @param gl WebGL2RenderingContext
   */
  renderToScreen(gl: WebGL2RenderingContext) {
    gl.useProgram(this.progInfo.program)

    this.uniforms.time = Stats.totalTime
    this.uniforms.delta = Stats.deltaTime
    this.uniforms.frame = Stats.frameCount

    twgl.setUniforms(this.progInfo, this.uniforms)
    twgl.setBuffersAndAttributes(gl, this.progInfo, this.buffInfo)

    twgl.bindFramebufferInfo(gl, null)
    twgl.drawBufferInfo(gl, this.buffInfo)
  }

  /**
   * Get the framebuffer that this post effects is rendering to
   * Used to update the image that the post effects will update
   */
  get frameBuffer() {
    return this._frameBuff
  }

  /**
   * Create a simple scanlines effect with noise and flickering
   * Taken from https://www.shadertoy.com/view/3dBSRD
   * @param gl WebGL2RenderingContext
   * @param density Density of scanlines, 0.0 - 1.0
   * @param opacity Opacity of scanlines, 0.0 - 1.0
   * @param noise Amount of noise, 0.0 - 1.0
   * @param flicker Amount of flickering, 0.0 - 1.0
   */
  static scanlines(gl: WebGL2RenderingContext, density: number, opacity: number, noise: number, flicker: number) {
    const shader = `
    float density = ${density.toFixed(3)};
    float opacityScanline = ${opacity.toFixed(3)};
    float opacityNoise = ${noise.toFixed(3)};
    float flickering = ${flicker.toFixed(3)};
  
    void main() {
      vec3 col = texture(image, pos).rgb;
      
      float count = height * density;
      vec2 sl = vec2(sin(pos.y * count), cos(pos.y * count));
      vec3 scanlines = vec3(sl.x, sl.y, sl.x);
  
      col += col * scanlines * opacityScanline;
      col += col * vec3(randF(pos * time)) * opacityNoise;
      col += col * sin(110.0 * time) * flickering;
  
      pixel = vec4(col, 1.0);
    }`

    return new PostEffects(gl, shader)
  }

  /**
   * Create a glitch effect with horizontal lines
   * @param gl WebGL2RenderingContext
   * @param amount Amount of glitch, 0.0 - 1.0
   */
  static glitch(gl: WebGL2RenderingContext, amount: number) {
    const shader = `
    float amount = ${amount.toFixed(3)};
    
    void main() {
      vec3 col = texture(image, pos).rgb;

      float offset = randF(vec2(time, pos.y)) * amount;

      col.r = texture(image, vec2(pos.x + offset, pos.y)).r;
      col.g = texture(image, vec2(pos.x - offset, pos.y)).g;
      col.b = texture(image, vec2(pos.x + offset, pos.y)).b;

      pixel = vec4(col, 1.0);
    }`

    return new PostEffects(gl, shader)
  }

  /**
   * Create duotone effect with two colours and contrast
   * @param gl WebGL2RenderingContext
   */
  static duotone(gl: WebGL2RenderingContext, colour1: RGB, colour2: RGB, contrast: number) {
    const shader = `    
    vec3 col1 = vec3(${colour1[0].toFixed(3)}, ${colour1[1].toFixed(3)}, ${colour1[2].toFixed(3)});
    vec3 col2 = vec3(${colour2[0].toFixed(3)}, ${colour2[1].toFixed(3)}, ${colour2[2].toFixed(3)});
    float contrast = ${contrast.toFixed(3)};

    void main() {
      vec3 col = texture(image, pos).rgb;

      vec3 lumFactor = vec3(0.2126, 0.7152, 0.0722);
      vec3 desat = vec3(dot(col, lumFactor));

      // increase contrast
      desat = pow(desat, vec3(contrast));
      desat *= contrast;
      
      pixel = vec4(mix(col1, col2, desat), 1.0);
    }`

    return new PostEffects(gl, shader)
  }

  /**
   * Create a noise effect
   * @param gl WebGL2RenderingContext
   * @param amount Amount of noise, 0.0 - 1.0
   * @param speed Speed of noise change
   */
  static noise(gl: WebGL2RenderingContext, amount: number, speed: number) {
    const shader = `
    float amount = ${amount.toFixed(3)};
    float speed = ${speed.toFixed(3)};
    
    void main() {
      vec3 col = texture(image, pos).rgb;
    
      col.r += randPhase(pos, speed) * amount;
      col.g += randPhase(pos - 0.1, speed) * amount;
      col.b += randPhase(pos + 0.1, speed) * amount;
    
      //col += rand(8.0 * time).rgb * amount;

      pixel = vec4(col, 1.0);
    }`

    return new PostEffects(gl, shader)
  }

  /**
   * Create a two colour contrast threshold effect
   * @param gl WebGL2RenderingContext
   * @param threshold Threshold value, 0.0 - 1.0
   * @param colourDark Dark colour
   * @param colourBright Bright colour
   */
  static contrast(gl: WebGL2RenderingContext, threshold: number, colourDark: RGB, colourBright: RGB) {
    const shader = `
    float threshold = ${threshold.toFixed(3)};
    vec3 bright = vec3(${colourBright[0].toFixed(3)}, ${colourBright[1].toFixed(3)}, ${colourBright[2].toFixed(3)});
    vec3 dark = vec3(${colourDark[0].toFixed(3)}, ${colourDark[1].toFixed(3)}, ${colourDark[2].toFixed(3)});

    void main() {
      vec3 col = texture(image, pos).rgb;

      float brightness = (col.r + col.g + col.b) / 3.0;
      brightness = clamp(brightness, 0.0, 1.0);

      if (brightness > threshold) {
        pixel = vec4(bright, 1.0);
      } else {
        pixel = vec4(dark, 1.0);
      }
    }`

    return new PostEffects(gl, shader)
  }
}
