// ===== post-effects.ts ===============================================================================
// Full screen effects and post processing
// Ben Coleman, 2023
// =============================================================================================

import * as log from 'loglevel'
import * as twgl from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Stats } from '../index.ts'

/**
 * PostEffects class, used to render full screen effects and post processing
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
    }

    console.log(this.uniforms)

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
    out vec4 pixel;

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
   */
  static scanlines(gl: WebGL2RenderingContext, density: number, opacity: number, noise: number, flicker: number) {
    const shader = `
    float density = ${density.toFixed(3)};
    float opacityScanline = ${opacity.toFixed(3)};
    float opacityNoise = ${noise.toFixed(3)};
    float flickering = ${flicker.toFixed(3)};
    
    float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    } 
  
    void main() {
      vec3 col = texture(image, pos).rgb;
      
      float count = height * density;
      vec2 sl = vec2(sin(pos.y * count), cos(pos.y * count));
      vec3 scanlines = vec3(sl.x, sl.y, sl.x);
  
      col += col * scanlines * opacityScanline;
      col += col * vec3(random(pos * time)) * opacityNoise;
      col += col * sin(110.0 * time) * flickering;
  
      pixel = vec4(col, 1.0);
    }`

    const effect = new PostEffects(gl, shader)
    return effect
  }
}
