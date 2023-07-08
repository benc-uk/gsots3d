// ============================================================================
// Gouraud fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

varying vec4 v_lightingDiffuse;
varying vec4 v_lightingSpecular;
varying vec2 v_texCoord;

uniform sampler2D u_matTexture;
uniform vec4 u_matDiffuse;

void main() {
  // Tried to set the objectColour in the vertex shader, rather than here.
  // But texture mapping + Gouraud shading, it looks terrible
  vec4 objectColour = texture2D(u_matTexture, v_texCoord) * u_matDiffuse;

  gl_FragColor = (objectColour * v_lightingDiffuse) + v_lightingSpecular;
}