// ======== primitive.ts ======================================================
// Main model class, holds a list of parts, each with a material
// Models are parsed from OBJ files
// Ben Coleman, 2023
// ============================================================================

import {
  ProgramInfo,
  drawBufferInfo,
  setBuffersAndAttributes,
  setUniforms,
  primitives,
  BufferInfo,
  createBufferInfoFromArrays,
} from 'twgl.js'
import { UniformSet } from '../core/gl.ts'
import { Renderable } from './types.ts'
import { Material } from '../engine/material.ts'
import { stats } from '../core/stats.ts'
import { ProgramCache } from '../core/cache.ts'

/**
 * A simple primitive 3D object, like a sphere or cube
 */
export abstract class Primitive implements Renderable {
  protected bufferInfo: BufferInfo | undefined
  private programInfo: ProgramInfo
  public material: Material
  public tex: WebGLTexture | undefined
  protected triangles: number

  constructor() {
    this.material = new Material()
    this.triangles = 0
    this.programInfo = ProgramCache.instance.default
  }

  get triangleCount(): number {
    return this.triangles
  }

  /**
   * Render is used draw this primitive, this is called from the Instance that wraps
   * this renderable.
   */
  render(gl: WebGL2RenderingContext, uniforms: UniformSet, materialOverride?: Material): void {
    if (!this.bufferInfo) return

    gl.useProgram(this.programInfo.program)

    if (materialOverride === undefined) {
      this.material.apply(this.programInfo)
    } else {
      materialOverride.apply(this.programInfo)
    }

    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
    setUniforms(this.programInfo, uniforms)

    drawBufferInfo(gl, this.bufferInfo)
    stats.drawCallsPerFrame++
  }
}

/**
 * A simple sphere primitive with a given radius and subdivisions
 */
export class PrimitiveSphere extends Primitive {
  /**
   * Create a new sphere primitive
   * @param gl WebGL2RenderingContext
   * @param radius Radius of the sphere
   * @param subdivisionsH Number of horizontal subdivisions
   * @param subdivisionsV Number of vertical subdivisions
   */
  constructor(gl: WebGL2RenderingContext, radius: number, subdivisionsH: number, subdivisionsV: number) {
    super()

    const verts = primitives.createSphereVertices(radius, subdivisionsH, subdivisionsV)

    // Flip the texture coords, so they match models loaded from OBJ files
    for (let i = 0; i < verts.texcoord.length; i += 2) {
      verts.texcoord[i + 1] = 1 - verts.texcoord[i + 1]
    }

    this.bufferInfo = createBufferInfoFromArrays(gl, verts)

    this.triangles += this.bufferInfo.numElements / 3
  }
}

/**
 * A simple cube primitive with a given size
 */
export class PrimitiveCube extends Primitive {
  /**
   * Create a new cube primitive
   * @param gl WebGL2RenderingContext
   * @param size Size of the cube
   */
  constructor(gl: WebGL2RenderingContext, size: number) {
    super()

    const verts = primitives.createCubeVertices(size)

    // Flip the texture coords, so they match models loaded from OBJ files
    for (let i = 0; i < verts.texcoord.length; i += 2) {
      verts.texcoord[i + 1] = 1 - verts.texcoord[i + 1]
    }

    this.bufferInfo = createBufferInfoFromArrays(gl, verts)

    this.triangles += this.bufferInfo.numElements / 3
  }
}

/**
 * A simple plane primitive with a given size, subdivisions & tiling factor
 */
export class PrimitivePlane extends Primitive {
  /**
   * Create a new plane primitive
   * @param gl WebGL2RenderingContext
   * @param width Width of the plane
   * @param height Height of the plane
   * @param subdivisionsW Number of horizontal subdivisions
   * @param subdivisionsH Number of vertical subdivisions
   * @param tilingFactor Number of times to tile the texture across the plane
   */
  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    subdivisionsW: number,
    subdivisionsH: number,
    tilingFactor: number
  ) {
    super()

    const verts = primitives.createPlaneVertices(width, height, subdivisionsW, subdivisionsH)

    // Mutate the texture coords to tile the texture
    for (let i = 0; i < verts.texcoord.length; i++) {
      verts.texcoord[i] = verts.texcoord[i] * tilingFactor
    }

    // Flip the texture coords, so they match models loaded from OBJ files
    for (let i = 0; i < verts.texcoord.length; i += 2) {
      verts.texcoord[i + 1] = 1 - verts.texcoord[i + 1]
    }

    this.bufferInfo = createBufferInfoFromArrays(gl, verts)
    this.triangles += this.bufferInfo.numElements / 3
  }
}

/**
 * A simple cylinder primitive with a given radius, height and subdivisions
 */
export class PrimitiveCylinder extends Primitive {
  /**
   * Create a new cylinder primitive
   * @param gl WebGL2RenderingContext
   * @param radius Radius of the cylinder
   * @param height Height of the cylinder
   * @param subdivisionsR Subdivisions around the cylinder
   * @param subdivisionsV Subdivisions vertically
   * @param caps Should the cylinder have caps
   */
  constructor(
    gl: WebGL2RenderingContext,
    radius: number,
    height: number,
    subdivisionsR: number,
    subdivisionsV: number,
    caps: boolean
  ) {
    super()

    const verts = primitives.createCylinderVertices(radius, height, subdivisionsR, subdivisionsV, caps)

    // Flip the texture coords, so they match models loaded from OBJ files
    for (let i = 0; i < verts.texcoord.length; i += 2) {
      verts.texcoord[i + 1] = 1 - verts.texcoord[i + 1]
    }

    this.bufferInfo = createBufferInfoFromArrays(gl, verts)

    this.triangles += this.bufferInfo.numElements / 3
  }
}
