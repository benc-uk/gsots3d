#version 300 es

// ============================================================================
// Environment map vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position;

uniform mat4 u_worldViewProjection;

out vec3 v_texCoord;

void main() {
  // This essentially is what makes the envmap work, texCoords
  // are taken from the vertex position
  v_texCoord = position.xyz;

  gl_Position = u_worldViewProjection * position;
}
