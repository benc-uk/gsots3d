#version 300 es

// ============================================================================
// Billboard vertex shader
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
  bool enabled;
};

// Input attributes from buffers
in vec4 position;
in vec2 texcoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform int u_lightsPosCount;
uniform vec3 u_camPos;
uniform LightDir u_lightDirGlobal;
uniform LightPos u_lightsPos[MAX_LIGHTS];

// Output varying's to pass to fragment shader
out vec2 v_texCoord;
out vec3 v_lighting;

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
  v_texCoord = texcoord;
  gl_Position = u_worldViewProjection * position;
  vec3 worldPos = (u_world * position).xyz;

  // Normal for a billboard always points at camera
  vec3 worldNormal = normalize(u_camPos - worldPos);

  vec3 V = normalize(u_camPos - worldPos);
  vec3 N = normalize(worldNormal);
  float fudge = 1.5;

  // Add point lights to lighting output
  for (int i = 0; i < u_lightsPosCount; i++) {
    LightPos light = u_lightsPos[i];
    vec3 L = normalize(light.position - worldPos.xyz);

    float diffuse = max(dot(N, L), 0.0);

    // Distance attenuation
    float distance = length(light.position - worldPos.xyz);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quad * (distance * distance));

    // Note small hack here to fudge the light intensity
    v_lighting += light.colour * fudge * attenuation * diffuse;
  }

  // Add in global directional light
  // Approximate by using a fixed direction for the normal pointing up
  vec3 globalLightL = normalize(-u_lightDirGlobal.direction);
  float globalDiffuse = dot(vec3(0.0, 1.0, 0.0), globalLightL);
  v_lighting += u_lightDirGlobal.colour * globalDiffuse;
}
