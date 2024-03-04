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
  float reflectivity;
  sampler2D diffuseTex;
  sampler2D specularTex;
  sampler2D normalTex;
  bool hasNormalTex;
  float alphaCutoff;
};

// From vertex shader
in vec2 v_texCoord;
in vec3 v_lighting;

// Main lights and material uniforms
uniform Material u_mat;
uniform float u_gamma;

// Output colour of this pixel/fragment
out vec4 outColour;

void main() {
  vec4 texel = texture(u_mat.diffuseTex, v_texCoord);

  // Magic to make transparent sprites work, without blending
  // Somehow this also works with the shadow map render pass, which is a bonus
  if (texel.a < u_mat.alphaCutoff) {
    discard;
  }

  vec3 colour = texel.rgb * u_mat.diffuse * v_lighting;
  float e = u_mat.emissive.r + u_mat.emissive.g + u_mat.emissive.b;
  if (e > 0.0) {
    colour = texel.rgb * u_mat.emissive;
  }

  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL
  colour = pow(colour, vec3(1.0 / u_gamma));

  outColour = vec4(colour, u_mat.opacity);
}
