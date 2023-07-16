#version 300 es

// ============================================================================
// Gouraud vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

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
};

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
  sampler2D diffuseTex;
  sampler2D specularTex;
};

// Input attributes from buffers
in vec4 position;
in vec3 normal;
in vec2 texcoord;

// Some global uniforms
uniform mat4 u_world;
uniform vec3 u_camPos;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// Main light and material uniforms
uniform LightDir u_lightDirGlobal;
uniform Material u_mat;

flat out vec3 v_lightingDiffuse;
flat out vec3 v_lightingSpecular;
out vec2 v_texCoord;

/*
 * Legacy lighting calc
 */
vec2 lightCalc(vec3 N, vec3 L, vec3 H, float shininess) {
  float diff = dot(N, L);

  return vec2(diff, diff > 0.0 ? pow(max(dot(N, H), 0.0), shininess) : 0.0);
}

void main() {
  LightDir light = u_lightDirGlobal;
  vec3 worldNormal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  vec3 worldPos = (u_world * position).xyz;

  vec3 V = normalize(u_camPos - worldPos);
  vec3 N = normalize(worldNormal);
  vec3 L = normalize(-light.direction.xyz);
  vec3 H = normalize(L + V);

  vec2 l = lightCalc(N, L, H, u_mat.shininess);

  // Output lighting value for fragment shader to use, no color
  v_lightingDiffuse = light.ambient * u_mat.ambient + light.colour * max(l.x, 0.0);

  // Pass specular in a seperate varying
  v_lightingSpecular = light.colour * u_mat.specular * l.y;

  // Pass through varying texture coordinate, so we can get the colour there
  v_texCoord = texcoord;

  gl_Position = u_worldViewProjection * position;
}
