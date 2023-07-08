#version 300 es

// ============================================================================
// Phong vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// Input attributes from buffers
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;

// Output varying's to pass to fragment shader
out vec2 v_texCoord;
out vec3 v_normal;
out vec4 v_position;

void main() {
  v_texCoord = texcoord;
  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  v_position = u_world * position;

  gl_Position = u_worldViewProjection * position;
}