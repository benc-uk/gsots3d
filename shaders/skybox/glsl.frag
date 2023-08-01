#version 300 es

// ============================================================================
// Skybox fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec3 v_texCoord;

uniform samplerCube u_skyboxTex;

out vec4 outColour;

void main() {
  // Use the texture cube map as the colour
  // Note: We don't need to do any lighting calculations here
  outColour = texture(u_skyboxTex, v_texCoord);
}
