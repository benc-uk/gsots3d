#version 300 es

// ============================================================================
// Skybox vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position;

uniform mat4 u_worldViewProjection;

out vec3 v_texCoord;

void main() {
  // This essentially is what makes the skybox work, texCoords
  // are taken from the vertex position
  v_texCoord = position.xyz;

  gl_Position = u_worldViewProjection * position;
}
