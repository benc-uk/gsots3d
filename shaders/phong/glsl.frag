#version 300 es

// ============================================================================
// Phong fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

const int MAX_LIGHTS = 16;

struct LightPos {
  vec3 position;
  vec3 colour;
  vec3 ambient;
  float constant;
  float linear;
  float quad;
};

struct LightDir {
  vec3 direction;
  vec3 colour;
  vec3 ambient;
};

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
  sampler2D diffuseTex;
  sampler2D specularTex;
};

// From vertex shader
in vec3 v_normal;
in vec2 v_texCoord;
in vec4 v_position;

// Some global uniforms
uniform mat4 u_world;
uniform vec3 u_camPos;

// Main lights and material uniforms
uniform Material u_mat;
uniform LightDir u_lightDirGlobal;
uniform LightPos u_lightsPos[MAX_LIGHTS];
uniform int u_lightsPosCount;

// Output colour of this pixel/fragment
out vec3 outColour;

/*
 * Shade a fragment using a directional light source
 */
vec3 shadeDirLight(LightDir light, Material mat, vec3 N, vec3 V) {
  vec3 L = normalize(-light.direction);
  vec3 H = normalize(L + V);

  vec3 diffuseCol = vec3(texture(mat.diffuseTex, v_texCoord)) * mat.diffuse;
  vec3 specularCol = vec3(texture(mat.specularTex, v_texCoord)) * mat.specular;

  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;

  vec3 ambient = light.ambient * mat.ambient * diffuseCol;
  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol;
  vec3 specular = light.colour * spec * specularCol;

  return ambient + diffuse + specular;
}

/*
 * Shade a fragment using a positional light source
 */
vec3 shadePosLight(LightPos light, Material mat, vec3 N, vec3 V) {
  vec3 L = normalize(light.position - v_position.xyz);
  vec3 H = normalize(L + V);

  vec3 diffuseCol = vec3(texture(mat.diffuseTex, v_texCoord)) * mat.diffuse;
  vec3 specularCol = vec3(texture(mat.specularTex, v_texCoord)) * mat.specular;

  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;

  // attenuation
  float dist = length(light.position - v_position.xyz);
  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quad * (dist * dist));

  vec3 ambient = light.ambient * mat.ambient * diffuseCol;
  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol;
  vec3 specular = light.colour * spec * specularCol;

  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;

  return ambient + diffuse + specular;
}

void main() {
  vec3 V = normalize(u_camPos - v_position.xyz);

  vec3 outColorPart = shadeDirLight(u_lightDirGlobal, u_mat, normalize(v_normal), V);

  for (int i = 0; i < u_lightsPosCount; i++) {
    outColorPart += shadePosLight(u_lightsPos[i], u_mat, normalize(v_normal), V);
  }

  outColour = outColorPart;
}
