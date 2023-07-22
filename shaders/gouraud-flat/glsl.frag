#version 300 es

// ============================================================================
// Gouraud fragment shader with flat shading
// Ben Coleman, 2023
// ============================================================================

precision highp float;

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  vec3 emissive;
  float shininess;
  float opacity;
  sampler2D diffuseTex;
  sampler2D specularTex;
};

// From vertex shader, note flat keyword!
flat in vec3 v_lightingDiffuse;
flat in vec3 v_lightingSpecular;
in vec2 v_texCoord;

uniform Material u_mat;
uniform float u_gamma;

// Output colour of this pixel/fragment
out vec4 outColour;

void main() {
  // Tried to set the objectColour in the vertex shader, rather than here.aa
  // But texture mapping + Gouraud shading, it looks terrible
  vec3 objectColour = vec3(texture(u_mat.diffuseTex, v_texCoord)) * u_mat.diffuse;

  vec3 colour = objectColour * v_lightingDiffuse + v_lightingSpecular;

  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL
  colour.rgb = pow(colour.rgb, vec3(1.0 / u_gamma));

  outColour = vec4(colour, 1.0);
}
