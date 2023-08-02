#version 300 es

// ============================================================================
// Environment map fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec3 v_texCoord;

uniform samplerCube u_envMapTex;

out vec4 outColour;

void main() {
  // Use the texture cube map as the colour
  // Note: We don't need to do any lighting calculations here
  outColour = texture(u_envMapTex, v_texCoord);
}
