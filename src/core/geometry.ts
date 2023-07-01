// ===== Geometry.ts ==========================================================
// A low level geometry type, used by the OBJ parser
// - you shouldn't need to use this directly
// Ben Coleman, 2023
// ============================================================================

export type Geometry = {
  material: string
  data: {
    positions: number[]
    texcoords?: number[]
    normals: number[]
  }
}
