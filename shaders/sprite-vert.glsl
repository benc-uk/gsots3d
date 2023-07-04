// =============================================================
// Vertex shader for billboarded sprites, with transparency
// =============================================================

precision highp float;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

attribute vec4 position;
attribute vec2 texcoord;

varying vec2 v_texCoord;
varying vec4 v_position;

void main() {
  v_texCoord = texcoord;

  v_position = u_world * position;
  gl_Position = u_worldViewProjection * position;
}