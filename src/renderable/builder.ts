// ===== builder.ts =========================================================
// Instance builder for creating custom renderable instances
// Ben Coleman, 2024
// ============================================================================

import * as twgl from 'twgl.js'
import { vec3 } from 'gl-matrix'

import { Renderable } from './types.ts'
import { ProgramCache } from '../core/cache.ts'
import { Stats } from '../core/stats.ts'
import { UniformSet } from '../core/gl.ts'
import { Material } from '../engine/material.ts'
import { XYZ } from '../engine/tuples.ts'

// TODO: No support for smooth shading, with shared vertices and normals
// TODO: NO support for multiple parts & materials

/**
 * A simple builder class for creating custom renderable instances with triangle meshes
 *
 * Example usage:
 * ```typescript
 * const builder = new RenderableBuilder()
 * builder.addTriangle([1, -1, 1], [1, 1, 1], [-1, 1, 1])
 * const renderable = builder.build(gl)
 */
export class RenderableBuilder {
  private vertexData: number[] = []
  private vertexCount: number = 0
  private indexData: number[] = []
  private indexCount: number = 0
  private normalData: number[] = []
  private texcoordData: number[] = []

  private triangleCount: number = 0
  private _customArrayData: twgl.Arrays | undefined

  private addVertex(x: number, y: number, z: number): number {
    this.vertexData.push(x, y, z)
    return this.vertexCount++
  }

  private addIndex(): number {
    this.indexData.push(this.indexCount)
    return this.indexCount++
  }

  private addNormal(n: XYZ) {
    this.normalData.push(n[0], n[1], n[2])
  }

  /**
   * Add a triangle to the renderable
   * Each triangle must be defined by 3 vertices and will get a normal calculated
   * Each triangle will get a unique normal, so no smooth shading
   * @param v1 Vertex one of the triangle
   * @param v2 Vertex two of the triangle
   * @param v3 Vertex three of the triangle
   */
  addTriangle(v1: XYZ, v2: XYZ, v3: XYZ, tc1 = [0, 0], tc2 = [0, 0], tc3 = [0, 0]) {
    this.triangleCount++
    this.addVertex(v1[0], v1[1], v1[2])
    this.addIndex()
    this.addVertex(v2[0], v2[1], v2[2])
    this.addIndex()
    this.addVertex(v3[0], v3[1], v3[2])
    this.addIndex()

    // Normal calculation
    const u = vec3.subtract(vec3.create(), v2, v1)
    const v = vec3.subtract(vec3.create(), v3, v1)
    const n = vec3.cross(vec3.create(), u, v)
    vec3.normalize(n, n)

    this.addNormal([n[0], n[1], n[2]])
    this.addNormal([n[0], n[1], n[2]])
    this.addNormal([n[0], n[1], n[2]])

    this.texcoordData.push(...tc1, ...tc2, ...tc3)
  }

  /*
   * Add a two triangle quad to the renderable
   * Each quad must be defined by 4 vertices and will get a normal calculated
   * Each quad will get a unique normal, so no smooth shading
   * @param v1 Vertex one of the quad
   * @param v2 Vertex two of the quad
   * @param v3 Vertex three of the quad
   * @param v4 Vertex four of the quad
   */
  addQuad(v1: XYZ, v2: XYZ, v3: XYZ, v4: XYZ, tc1 = [0, 0], tc2 = [0, 0], tc3 = [0, 0], tc4 = [0, 0]) {
    // Anti-clockwise winding order
    this.addTriangle(v1, v2, v3, tc1, tc2, tc3)
    this.addTriangle(v1, v3, v4, tc1, tc3, tc4)
  }

  /**
   * This is a very advanced feature, and allows you to provide your own twgl.Arrays
   * This is useful for creating custom renderables from existing data
   * @param array The twgl.Arrays to use for the renderable
   */
  set customArrayData(array: twgl.Arrays) {
    this._customArrayData = array
  }

  /**
   * Build the renderable from the data added
   * @param gl A WebGL2 rendering context
   * @returns A new CustomRenderable instance
   */
  build(gl: WebGL2RenderingContext): CustomRenderable {
    let bufferInfo: twgl.BufferInfo
    if (this._customArrayData) {
      bufferInfo = twgl.createBufferInfoFromArrays(gl, this._customArrayData)
    } else {
      if (this.vertexData.length === 0) {
        throw new Error('No vertices added to renderable')
      }

      if (this.indexData.length === 0) {
        throw new Error('No indices added to renderable')
      }

      // This is where the magic happens
      bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: this.vertexData,
        indices: this.indexData,
        normal: this.normalData,
        texcoord: this.texcoordData,
      })
    }

    return new CustomRenderable(bufferInfo, ProgramCache.instance.default, new Material(), this.triangleCount)
  }
}

/**
 * A custom renderable instance, created from a RenderableBuilder
 */
class CustomRenderable implements Renderable {
  private bufferInfo: twgl.BufferInfo
  private programInfo: twgl.ProgramInfo = ProgramCache.instance.default
  private _triangleCount: number = 0
  public material: Material

  constructor(bufferInfo: twgl.BufferInfo, programInfo: twgl.ProgramInfo, material: Material, triCount: number) {
    this.bufferInfo = bufferInfo
    this.programInfo = programInfo
    this.material = material
    this._triangleCount = triCount
  }

  render(
    gl: WebGL2RenderingContext,
    uniforms: UniformSet,
    materialOverride?: Material,
    programOverride?: twgl.ProgramInfo,
  ) {
    if (!this.bufferInfo) return
    if (!this.material) return

    const programInfo = programOverride || this.programInfo
    gl.useProgram(programInfo.program)

    if (materialOverride === undefined) {
      this.material.apply(programInfo)
    } else {
      materialOverride.apply(programInfo)
    }

    twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
    twgl.setUniforms(programInfo, uniforms)

    twgl.drawBufferInfo(gl, this.bufferInfo)

    Stats.drawCallsPerFrame++
  }

  get triangleCount(): number {
    return this._triangleCount
  }
}
