#version 300 es

// ============================================================================
// Billboard fragment shader
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

struct LightDir {
  vec3 direction;
  vec3 colour;
  vec3 ambient;
};

// From vertex shader
in vec2 v_texCoord;
in vec4 v_position;

// Uniforms
uniform Material u_mat;
uniform LightDir u_lightDirGlobal;

// Output colour of this pixel/fragment
out vec4 outColour;

void main() {
  vec4 texel = texture(u_mat.diffuseTex, v_texCoord);

  // Magic to make transparent sprites work, without blending
  if (texel.a < 0.5) {
    discard;
  }

  outColour = vec4(texel.rgb * u_mat.diffuse * u_lightDirGlobal.colour, 1.0);
}
