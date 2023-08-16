#version 300 es

// ============================================================================
// Particle render fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec2 v_texcoord;
in float v_ageNorm;

uniform sampler2D u_texture;
uniform vec4 u_ageColour;
uniform vec4 u_preColour;

out vec4 outColor;

void main() {
  vec4 tex = texture(u_texture, v_texcoord);
  tex.r *= u_preColour.r;
  tex.g *= u_preColour.g;
  tex.b *= u_preColour.b;
  tex.a *= u_preColour.a;

  tex.a *= 1.0 - v_ageNorm * u_ageColour.a;
  tex.r *= 1.0 - v_ageNorm * u_ageColour.r;
  tex.g *= 1.0 - v_ageNorm * u_ageColour.g;
  tex.b *= 1.0 - v_ageNorm * u_ageColour.b;

  outColor = tex;
}
