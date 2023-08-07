#version 300 es

// ============================================================================
// Shadow map vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position;

uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * position;
}
