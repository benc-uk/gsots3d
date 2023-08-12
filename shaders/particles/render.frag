#version 300 es

// ============================================================================
// Particle render fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
