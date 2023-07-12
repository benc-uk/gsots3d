#version 300 es

// ============================================================================
// Gouraud fragment shader with flat shading
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// From vertex shader
flat in vec4 v_lightingDiffuse;
flat in vec4 v_lightingSpecular;
in vec2 v_texCoord;

uniform sampler2D u_matDiffuseTex;
uniform vec4 u_matDiffuse;

// Output colour of this pixel/fragment
out vec4 outColour;

void main() {
  // Tried to set the objectColour in the vertex shader, rather than here.
  // But texture mapping + Gouraud shading, it looks terrible
  vec4 objectColour = texture(u_matDiffuseTex, v_texCoord) * u_matDiffuse;

  outColour = objectColour * v_lightingDiffuse + v_lightingSpecular;
}
