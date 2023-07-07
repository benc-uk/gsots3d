// ===== models/primitive.ts ======================================================
// Main model class, holds a list of parts, each with a material
// Models are parsed from OBJ files
// Ben Coleman, 2023
// ============================================================================

import { ProgramInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms, primitives, BufferInfo } from 'twgl.js'
import { Renderable, UniformSet } from '../core/types.ts'
import { Material } from '../index.ts'

/**
 * A simple primitive 3D object, like a sphere or cube
 */
export abstract class Primitive implements Renderable {
  protected bufferInfo: BufferInfo | undefined
  public material: Material
  public tex: WebGLTexture | undefined

  constructor() {
    this.material = new Material()
  }

  render(gl: WebGL2RenderingContext, uniforms: UniformSet, programInfo: ProgramInfo): void {
    if (!this.bufferInfo) return

    this.material.apply(programInfo)

    setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
    setUniforms(programInfo, uniforms)

    drawBufferInfo(gl, this.bufferInfo)
  }
}

export class PrimitiveSphere extends Primitive {
  constructor(gl: WebGL2RenderingContext, radius: number, subdivisionsH: number, subdivisionsV: number) {
    super()

    this.bufferInfo = primitives.createSphereBufferInfo(gl, radius, subdivisionsH, subdivisionsV)
  }
}

export class PrimitiveCube extends Primitive {
  constructor(gl: WebGL2RenderingContext, size: number) {
    super()

    this.bufferInfo = primitives.createCubeBufferInfo(gl, size)
  }
}

export class PrimitivePlane extends Primitive {
  constructor(gl: WebGL2RenderingContext, width: number, height: number, subdivisionsW: number, subdivisionsH: number) {
    super()

    this.bufferInfo = primitives.createPlaneBufferInfo(gl, width, height, subdivisionsW, subdivisionsH)
  }
}
