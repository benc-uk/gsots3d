#version 300 es

// ============================================================================
// Billboard vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// Input attributes from buffers
in vec4 position;
in vec2 texcoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

// Output varying's to pass to fragment shader
out vec4 v_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = texcoord;
  v_position = u_world * position;
  gl_Position = u_worldViewProjection * position;
}
