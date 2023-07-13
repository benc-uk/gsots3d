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
  float shininess;
  sampler2D diffuseTex;
  sampler2D specularTex;
};

// From vertex shader
flat in vec3 v_lightingDiffuse;
flat in vec3 v_lightingSpecular;
in vec2 v_texCoord;

uniform Material u_mat;

// Output colour of this pixel/fragment
out vec3 outColour;

void main() {
  // Tried to set the objectColour in the vertex shader, rather than here.
  // But texture mapping + Gouraud shading, it looks terrible
  vec3 objectColour = vec3(texture(u_mat.diffuseTex, v_texCoord)) * u_mat.diffuse;

  outColour = objectColour * v_lightingDiffuse + v_lightingSpecular;
}
