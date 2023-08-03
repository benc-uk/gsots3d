// ============================================================================
// Shared and common definitions & structs for all shaders
// Ben Coleman, 2023
// ============================================================================

const int MAX_LIGHTS = 16;

struct LightDir {
  vec3 direction;
  vec3 colour;
  vec3 ambient;
};

struct LightPos {
  vec3 position;
  vec3 colour;
  vec3 ambient;
  float constant;
  float linear;
  float quad;
  bool enabled;
};

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
  samplerCube reflectTex;
  bool hasNormalTex;
};

vec4 mix4(vec4 a, vec4 b, float mix) {
  return a * (1.0 - mix) + b * mix;
}
