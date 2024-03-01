#version 300 es

// ============================================================================
// Phong fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// ===== Constants ============================================================

const int MAX_LIGHTS = 16;
const int MAX_SHADOWS = 8;
const float MAX_SHAD_A = 0.125;

// Got this from http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/#poisson-sampling
vec3 poissonDisk[8] = vec3[](
  vec3(-0.94201624, -0.39906216, -0.4684316),
  vec3(0.94558609, -0.76890725, -0.34478877),
  vec3(-0.094184101, -0.9293887, -0.3048823),
  vec3(0.34495938, 0.2938776, -0.001735733),
  vec3(-0.91588581, 0.45771432, -0.087759815),
  vec3(-0.81544232, -0.87912464, -0.03352997),
  vec3(-0.38277543, 0.27676845, -0.9485365),
  vec3(-0.58723171, -0.73007023, -0.22162315)
);

// ===== Structs ==============================================================

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
  bool hasNormalTex;
  bool unshaded;
  float alphaCutoff;
};

// Inputs from vertex shader
in vec3 v_normal;
in vec2 v_texCoord;
in vec4 v_position;
in vec4 v_shadowCoord;

// Some global uniforms
uniform vec3 u_camPos;
uniform float u_gamma;
uniform bool u_flipTextureX;
uniform bool u_flipTextureY;

// Main lights and material uniforms
uniform Material u_mat;
uniform LightDir u_lightDirGlobal;
uniform LightPos u_lightsPos[MAX_LIGHTS];
uniform int u_lightsPosCount;
// Reflection map isn't part of the material struct for complex reasons
uniform samplerCube u_reflectionMap;
// Shadows
uniform highp sampler2DShadow u_shadowMap;
// uniform float u_shadowScatter;  // REMOVED FOR NOW
uniform bool u_receiveShadow;

// Global texture coords shared between functions
vec2 texCoord;

// Output colour of this pixel/fragment
out vec4 outColour;

// ===== Helper functions =====================================================

// Simple mixer
vec4 mix4(vec4 a, vec4 b, float mix) {
  return a * (1.0 - mix) + b * mix;
}

// Function to help with get values from the shadow map
float shadowMapSample(highp sampler2DShadow map, vec3 coord) {
  // As WebGL 2 does not support GL_CLAMP_TO_BORDER or GL_TEXTURE_BORDER_COLOR, we need to do this :(
  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
    return 1.0;
  }

  return texture(map, coord);
}

// Shade a fragment using a directional light source
vec4 shadeDirLight(LightDir light, Material mat, vec3 N, vec3 V) {
  vec3 L = normalize(-light.direction);
  vec3 H = normalize(L + V);

  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;
  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;

  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;

  // Shadow map lookup
  vec3 projCoords = v_shadowCoord.xyz / v_shadowCoord.w * 0.5 + 0.5;

  // REMOVED FOR NOW - PCF for shadows using 8 samples of a poisson disk
  // float shadow = u_receiveShadow ? 0.0 : 1.0;
  // float scatter = u_shadowScatter / 100.0;
  // for (int i = u_receiveShadow ? 0 : MAX_SHADOWS; i < MAX_SHADOWS; i++) {
  //   vec3 offset = poissonDisk[i] * scatter;
  //   shadow += shadowMapSample(u_shadowMap, projCoords + offset) * MAX_SHAD_A;
  // }

  float shadow = u_receiveShadow ? shadowMapSample(u_shadowMap, projCoords) : 1.0;

  vec3 ambient = light.ambient * mat.ambient * diffuseCol;
  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * shadow;
  vec3 specular = light.colour * spec * specularCol * shadow;

  // Return a vec4 to support transparency, note specular is not affected by opacity
  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);
}

// Shade a fragment using a positional light source
vec4 shadePosLight(LightPos light, Material mat, vec3 N, vec3 V) {
  vec3 L = normalize(light.position - v_position.xyz);
  vec3 H = normalize(L + V);

  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;
  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;

  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;

  // Light attenuation, see: https://learnopengl.com/Lighting/Light-casters
  float dist = length(light.position - v_position.xyz);
  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quad * (dist * dist));

  vec3 ambient = light.ambient * mat.ambient * diffuseCol * attenuation;
  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * attenuation;
  vec3 specular = light.colour * spec * specularCol * attenuation;

  // Return a vec4 to support transparency, note specular is not affected by opacity
  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);
}

// ===== Main shader ==========================================================

void main() {
  vec3 V = normalize(u_camPos - v_position.xyz);

  // Flip texture coords if needed
  texCoord = u_flipTextureY ? vec2(v_texCoord.x, 1.0 - v_texCoord.y) : v_texCoord;
  texCoord = u_flipTextureX ? vec2(1.0 - texCoord.x, texCoord.y) : texCoord;

  // So parts of textures can be transparent
  vec4 texel = texture(u_mat.diffuseTex, texCoord);
  if (texel.a < u_mat.alphaCutoff) {
    discard;
  }

  vec3 N = normalize(v_normal);

  // Normal mapping, this is expensive so only do it if we have a normal map
  if (u_mat.hasNormalTex) {
    vec3 normMap = texture(u_mat.normalTex, texCoord).xyz * 2.0 - 1.0;

    vec3 Q1 = dFdx(v_position.xyz);
    vec3 Q2 = dFdy(v_position.xyz);
    vec2 st1 = dFdx(texCoord);
    vec2 st2 = dFdy(texCoord);

    vec3 T = -normalize(Q1 * st2.t - Q2 * st1.t);
    vec3 B = normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    N = normalize(TBN * normMap);
  }

  vec4 outColorPart;
  if (u_mat.unshaded) {
    // Skip lighting/shading and just use the texture if unshaded
    vec3 diffuseTexCol = vec3(texture(u_mat.diffuseTex, texCoord)) * u_mat.diffuse;
    outColorPart = vec4(diffuseTexCol, 1.0);
  } else {
    // Handle the main directional light, only one of these
    outColorPart = shadeDirLight(u_lightDirGlobal, u_mat, N, V);

    // Add positional lights
    for (int i = 0; i < u_lightsPosCount; i++) {
      outColorPart += shadePosLight(u_lightsPos[i], u_mat, N, V);
    }
  }

  // Add emissive component
  float emissiveAlpha = u_mat.emissive.r + u_mat.emissive.g + u_mat.emissive.b > 0.0 ? 1.0 : 0.0;
  outColorPart += vec4(u_mat.emissive, emissiveAlpha);

  // Get reflection vector and sample reflection texture
  vec3 R = reflect(-V, N);
  vec4 reflectCol = vec4(texture(u_reflectionMap, R).rgb, 1.0);

  // Add reflection component, not sure if this is correct, looks ok
  outColorPart = mix4(outColorPart, reflectCol, u_mat.reflectivity);

  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL
  outColorPart.rgb = pow(outColorPart.rgb, vec3(1.0 / u_gamma));

  outColour = outColorPart;
}
