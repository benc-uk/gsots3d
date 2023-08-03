#version 300 es
#extension GL_GOOGLE_include_directive : enable

// ============================================================================
// Phong fragment shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

#include "../common.glsl"

// From vertex shader
in vec3 v_normal;
in vec2 v_texCoord;
in vec4 v_position;

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

// Output colour of this pixel/fragment
out vec4 outColour;

// Global texture coords shared between functions
vec2 texCoord;

/*
 * Shade a fragment using a directional light source
 */
vec4 shadeDirLight(LightDir light, Material mat, vec3 N, vec3 V) {
  vec3 L = normalize(-light.direction);
  vec3 H = normalize(L + V);

  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;
  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;

  float diff = dot(N, L);
  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;

  vec3 ambient = light.ambient * mat.ambient * diffuseCol;
  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol;
  vec3 specular = light.colour * spec * specularCol;

  // Return a vec4 to support transparency, note specular is not affected by opacity
  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);
}

/*
 * Shade a fragment using a positional light source
 */
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

// ============================================================================
// Main fragment shader entry point
// ============================================================================
void main() {
  vec3 V = normalize(u_camPos - v_position.xyz);

  // Flip texture coords if needed
  texCoord = u_flipTextureY ? vec2(v_texCoord.x, 1.0 - v_texCoord.y) : v_texCoord;
  texCoord = u_flipTextureX ? vec2(1.0 - texCoord.x, texCoord.y) : texCoord;

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

  vec4 outColorPart = shadeDirLight(u_lightDirGlobal, u_mat, N, V);

  for (int i = 0; i < u_lightsPosCount; i++) {
    outColorPart += shadePosLight(u_lightsPos[i], u_mat, N, V);
  }

  // Add emissive component
  float emissiveAlpha = u_mat.emissive.r + u_mat.emissive.g + u_mat.emissive.b > 0.0 ? 1.0 : 0.0;
  outColorPart += vec4(u_mat.emissive, emissiveAlpha);

  // Get reflection vector and sample reflection texture
  vec3 R = reflect(-V, N);
  vec4 reflectCol = vec4(texture(u_mat.reflectTex, R).rgb, 1.0);

  // Not sure if this is correct, but it looks OK in most cases
  outColorPart = mix4(outColorPart, reflectCol, u_mat.reflectivity);

  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL
  outColorPart.rgb = pow(outColorPart.rgb, vec3(1.0 / u_gamma));

  outColour = outColorPart;
}
