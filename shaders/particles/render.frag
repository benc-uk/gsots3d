#version 300 es

// ============================================================================
// Particle render fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec2 v_texcoord;
in vec3 v_position;
in float v_ageNorm;

uniform sampler2D u_texture;
uniform vec4 u_ageColour;

out vec4 outColor;

void main() {
  vec4 tex = texture(u_texture, v_texcoord);
  tex.a *= 1.0 - v_ageNorm * u_ageColour.a;
  tex.r *= 1.0 - v_ageNorm * u_ageColour.r;
  tex.g *= 1.0 - v_ageNorm * u_ageColour.g;
  tex.b *= 1.0 - v_ageNorm * u_ageColour.b;

  outColor = tex;
}
