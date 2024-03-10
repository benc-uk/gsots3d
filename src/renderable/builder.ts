// ===== builder.ts =========================================================
// Model builder for creating custom models and multi-part geometry
// Ben Coleman, 2024
// ============================================================================

import * as twgl from 'twgl.js'
import { vec3 } from 'gl-matrix'

import { Material } from '../engine/material.ts'
import { XYZ } from '../engine/tuples.ts'

// TODO: No support for smooth shading, with shared vertices and normals

/**
 * A builder for creating multi-part models from triangle meshes
 * Use in conjunction Model.parseFromBuilder
 *
 * Example usage:
 * ```typescript
 * const builder = new ModelBuilder()
 * const part = builder.newPart('foo' Material.RED)
 * builder.addTriangle([1, -1, 1], [1, 1, 1], [-1, 1, 1])
 * Model.parseFromBuilder(builder, 'myModel')
 * ```
 */
export class ModelBuilder {
  public readonly parts: Map<string, BuilderPart>
  public readonly materials: Map<string, Material>

  constructor() {
    this.parts = new Map<string, BuilderPart>()
    this.materials = new Map<string, Material>()
  }

  /**
   * Create and add a 'part', each part should have a unique name, and material to apply to it
   * Vertex mesh data is then added to the part, with addQuad and addTriangle
   * @param name Name of this part, just a string can be anything
   * @param material Material to attach and apply to all surfaces in this part
   */
  newPart(name: string, material: Material): BuilderPart {
    if (this.parts.has(name)) {
      throw new Error('Builder part name exists!')
    }

    const builderPart = new BuilderPart()

    this.parts.set(name, builderPart)
    this.materials.set(name, material)

    return builderPart
  }
}

type extraAttributes = {
  [key: string]: { numComponents: number; data: number[] }
}

/**
 * Class to manage parts or sections to be built into a model
 */
export class BuilderPart {
  private vertexData: number[] = []
  private vertexCount: number = 0
  private indexData: number[] = []
  private indexCount: number = 0
  private normalData: number[] = []
  private texcoordData: number[] = []
  private _boundingBox: number[]

  /**
   * This is an *extremely* advanced feature, and allows you to add custom attributes to the part
   * You will need to understand how to use twgl.js to use this feature at the createBufferInfoFromArrays function
   */
  public extraAttributes?: extraAttributes

  public get boundingBox(): number[] {
    return this._boundingBox
  }

  private _triCount: number = 0

  public get triangleCount(): number {
    return this._triCount
  }

  private _customArrayData: twgl.Arrays | undefined

  constructor() {
    this._boundingBox = [
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MIN_VALUE,
      Number.MIN_VALUE,
    ]
  }

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
   * Add a triangle to the renderable part
   * Each triangle must be defined by 3 vertices and will get a normal calculated
   * Each triangle will get a unique normal, so no smooth shading
   * @param v1 Vertex one of the triangle
   * @param v2 Vertex two of the triangle
   * @param v3 Vertex three of the triangle
   * @param tc1 Texture coordinate for vertex 1
   * @param tc2 Texture coordinate for vertex 2
   * @param tc3 Texture coordinate for vertex 3
   */
  addTriangle(v1: XYZ, v2: XYZ, v3: XYZ, tc1 = [0, 0], tc2 = [0, 0], tc3 = [0, 0]) {
    this._triCount++
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

    // Update bounding box
    for (const v of [v1, v2, v3]) {
      if (v[0] < this._boundingBox[0]) this._boundingBox[0] = v[0]
      if (v[1] < this._boundingBox[1]) this._boundingBox[1] = v[1]
      if (v[2] < this._boundingBox[2]) this._boundingBox[2] = v[2]
      if (v[0] > this._boundingBox[3]) this._boundingBox[3] = v[0]
      if (v[1] > this._boundingBox[4]) this._boundingBox[4] = v[1]
      if (v[2] > this._boundingBox[5]) this._boundingBox[5] = v[2]
    }
  }

  /*
   * Add a two triangle quad to the renderable part
   * Each quad must be defined by 4 vertices and will get a normal calculated
   * Each quad will get a unique normal, so no smooth shading
   * @param v1 Vertex 1 of the quad
   * @param v2 Vertex 2 of the quad
   * @param v3 Vertex 3 of the quad
   * @param v4 Vertex 4 of the quad
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
   * Build the part from the data added and turn into a twgl.BufferInfo
   * @param gl A WebGL2 rendering context
   * @returns BufferInfo used by twgl
   */
  build(gl: WebGL2RenderingContext): twgl.BufferInfo | null {
    let bufferInfo: twgl.BufferInfo
    if (this._customArrayData) {
      bufferInfo = twgl.createBufferInfoFromArrays(gl, this._customArrayData)
    } else {
      if (this.vertexData.length === 0) {
        return null
      }

      if (this.indexData.length === 0) {
        return null
      }

      // This is where the magic happens
      bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: this.vertexData,
        indices: this.indexData,
        normal: this.normalData,
        texcoord: this.texcoordData,
        ...this.extraAttributes,
      })
    }

    return bufferInfo
  }
}
