#version 300 es

// ============================================================================
// Particle render fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec2 v_texcoord;
in vec3 v_position;

uniform sampler2D u_texture;
out vec4 outColor;

void main() {
  vec4 tex = texture(u_texture, v_texcoord);

  outColor = tex;
}