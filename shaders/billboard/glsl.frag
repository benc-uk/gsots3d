#version 300 es

// ============================================================================
// Billboard fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

const int MAX_LIGHTS = 16;

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
  if (texel.a < 0.8) {
    discard;
  }

  vec3 colour = texel.rgb * u_mat.diffuse * v_lighting;

  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL
  colour = pow(colour, vec3(1.0 / u_gamma));

  outColour = vec4(colour, u_mat.opacity);
}
