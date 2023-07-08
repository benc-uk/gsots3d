// ============================================================================
// Phong vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;

// Attributes from buffers
attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

// Varying's to pass to fragment shader
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec4 v_position;

void main() {
  v_texCoord = texcoord;
  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  v_position = u_world * position;

  gl_Position = u_worldViewProjection * position;
}