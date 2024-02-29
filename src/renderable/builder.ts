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
import { ModelPart } from './model.ts'

// TODO: No support for smooth shading, with shared vertices and normals

/**
 * A builder for creating multi-part custom renderable instances from triangle meshes
 *
 * Example usage:
 * ```typescript
 * const builder = new RenderableBuilder()
 * const part = builder.newPart('foo' Material.RED)
 * builder.addTriangle([1, -1, 1], [1, 1, 1], [-1, 1, 1])
 * const renderable = builder.build(gl)
 */
export class RenderableBuilder {
  private builderParts: Map<string, BuilderPart>
  private materials: Map<string, Material>

  constructor() {
    this.builderParts = new Map<string, BuilderPart>()
    this.materials = new Map<string, Material>()
  }

  /**
   * Create and add a 'part' each part should have a unique name, and material to apply to that part
   * Vertex mesh data is then added to the part
   * @param name Name of this part, just a string can be anything
   * @param material Material to attach and apply to all surfaces in this part
   */
  newPart(name: string, material: Material): BuilderPart {
    if (this.builderParts.has(name)) {
      throw new Error('Builder part name exists!')
    }

    const builderPart = new BuilderPart()

    this.builderParts.set(name, builderPart)
    this.materials.set(name, material)

    return builderPart
  }

  /**
   * Called after all parts are ready, to generate a CustomRenderable
   * @param gl A WebGL2RenderingContext
   */
  buildAllParts(gl: WebGL2RenderingContext): CustomRenderable {
    const buffers = new Map<string, twgl.BufferInfo>()

    for (const [name, builderPart] of this.builderParts) {
      buffers.set(name, builderPart.build(gl))
    }

    console.log(buffers)

    return new CustomRenderable(buffers, this.materials)
  }
}

/**
 * Class to manage parts or sections
 */
export class BuilderPart {
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
   * Add a triangle to the renderable part
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
   * Add a two triangle quad to the renderable part
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
   * @returns BufferInfo used by twgl
   */
  build(gl: WebGL2RenderingContext): twgl.BufferInfo {
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

    return bufferInfo
  }
}

/**
 * A custom renderable instance, created from a RenderableBuilder
 */
export class CustomRenderable implements Renderable {
  private programInfo: twgl.ProgramInfo = ProgramCache.instance.default
  private _triangleCount: number = 0
  private modelParts: ModelPart[]

  // List of materials mapped by name
  public readonly materials: Map<string, Material>

  constructor(bufferInfos: Map<string, twgl.BufferInfo>, materials: Map<string, Material>) {
    this.modelParts = new Array<ModelPart>()
    this.materials = materials

    for (const [name, bi] of bufferInfos) {
      const p = new ModelPart(bi, name)
      this.modelParts.push(p)
    }
  }

  /**
   * Render is used draw this custom renderable, this is called from the Instance that wraps
   * this renderable.
   */
  render(
    gl: WebGL2RenderingContext,
    uniforms: UniformSet,
    materialOverride?: Material,
    programOverride?: twgl.ProgramInfo,
  ) {
    const programInfo = programOverride || this.programInfo
    gl.useProgram(programInfo.program)

    // Render all parts
    for (const part of this.modelParts) {
      const bufferInfo = part.bufferInfo

      if (materialOverride === undefined) {
        const material = this.materials.get(part.materialName)
        if (!material) continue
        material.apply(programInfo)
      } else {
        materialOverride.apply(programInfo)
      }

      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
      twgl.setUniforms(programInfo, uniforms)

      twgl.drawBufferInfo(gl, bufferInfo)
      Stats.drawCallsPerFrame++
    }
  }

  get triangleCount(): number {
    return this._triangleCount
  }
}
