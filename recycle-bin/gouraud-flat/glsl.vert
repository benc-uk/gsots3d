#version 300 es

// ============================================================================
// Gouraud vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

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
};

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
uniform LightPos u_lightsPos[MAX_LIGHTS];
uniform int u_lightsPosCount;

flat out vec3 v_lightingDiffuse;
flat out vec3 v_lightingSpecular;
out vec2 v_texCoord;

/*
 * Legacy lighting calc
 * Returns vec2(diffuse, specular)
 */
vec2 lightCalc(vec3 N, vec3 L, vec3 H, float shininess) {
  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), shininess) : 0.0;
  return vec2(diff, spec);
}

void main() {
  LightDir lightGlobal = u_lightDirGlobal;
  vec3 worldNormal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  vec3 worldPos = (u_world * position).xyz;

  vec3 V = normalize(u_camPos - worldPos);
  vec3 N = normalize(worldNormal);
  vec3 L = normalize(-lightGlobal.direction.xyz);
  vec3 H = normalize(L + V);

  // Calculate lighting values for global light
  vec2 lVal = lightCalc(N, L, H, u_mat.shininess);

  // Output lighting values for fragment shader to use, no material color
  v_lightingDiffuse = lightGlobal.ambient * u_mat.ambient + lightGlobal.colour * max(lVal.x, 0.0);
  v_lightingSpecular = lightGlobal.colour * u_mat.specular * lVal.y;

  // Add in point lights
  for (int i = 0; i < u_lightsPosCount; i++) {
    LightPos lightPos = u_lightsPos[i];

    vec3 L = normalize(lightPos.position - worldPos);

    vec2 lVal = lightCalc(N, L, H, u_mat.shininess);

    v_lightingDiffuse += lightPos.ambient * u_mat.ambient + lightPos.colour * max(lVal.x, 0.0);
    v_lightingSpecular += max(lightPos.colour * u_mat.specular * lVal.y, 0.0);
  }

  // Pass through varying texture coordinate, so we can get the colour there
  v_texCoord = texcoord;

  gl_Position = u_worldViewProjection * position;
}
