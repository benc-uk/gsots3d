// ===== models/primitive.ts ======================================================
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

export class PrimitiveSphere extends Primitive {
  constructor(gl: WebGL2RenderingContext, radius: number, subdivisionsH: number, subdivisionsV: number) {
    super()

    this.bufferInfo = primitives.createSphereBufferInfo(gl, radius, subdivisionsH, subdivisionsV)

    this.triangles += this.bufferInfo.numElements / 3
  }
}

export class PrimitiveCube extends Primitive {
  constructor(gl: WebGL2RenderingContext, size: number) {
    super()

    this.bufferInfo = primitives.createCubeBufferInfo(gl, size)

    this.triangles += this.bufferInfo.numElements / 3
  }
}

export class PrimitivePlane extends Primitive {
  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    subdivisionsW: number,
    subdivisionsH: number,
    tilingFactor: number
  ) {
    super()

    const planeVerts = primitives.createPlaneVertices(width, height, subdivisionsW, subdivisionsH)

    for (let i = 0; i < planeVerts.texcoord.length; i++) {
      planeVerts.texcoord[i] = planeVerts.texcoord[i] * tilingFactor
    }

    this.bufferInfo = createBufferInfoFromArrays(gl, planeVerts)
    this.triangles += this.bufferInfo.numElements / 3
  }
}

export class PrimitiveCylinder extends Primitive {
  constructor(
    gl: WebGL2RenderingContext,
    radius: number,
    height: number,
    subdivisionsR: number,
    subdivisionsV: number,
    caps: boolean
  ) {
    super()

    this.bufferInfo = primitives.createCylinderBufferInfo(gl, radius, height, subdivisionsR, subdivisionsV, caps, caps)
    this.triangles += this.bufferInfo.numElements / 3
  }
}
