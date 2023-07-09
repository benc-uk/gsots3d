#version 300 es

// ============================================================================
// Phong vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// From vertex shader
in vec3 v_normal;
in vec2 v_texCoord;
in vec4 v_position;

uniform mat4 u_world;
uniform mat4 u_camMatrix;

// Material properties
uniform vec4 u_matAmbient;
uniform vec4 u_matDiffuse;
uniform vec4 u_matSpecular;
uniform float u_matShininess;
uniform sampler2D u_matTexture;

// Light properties
uniform vec4 u_lightPosition;
uniform vec4 u_lightColour;
uniform vec4 u_ambientLight;

// Output colour of this pixel/fragment
out vec4 outColour;

// lightCalc function returns two floats (packed into a vec2)
// One for diffuse component of lighting, the second for specular
// - normalN:          Surface normal (normalized)
// - surfaceToLightN:  Vector towards light (normalized)
// - halfVector:       Half vector towards camera (normalized)
// - shininess:        Hardness or size of specular highlights
vec2 lightCalc(vec3 normalN, vec3 surfaceToLightN, vec3 halfVector, float shininess) {
  float NdotL = dot(normalN, surfaceToLightN);
  float NdotH = dot(normalN, halfVector);

  return vec2(
    NdotL,
    NdotL > 0.0
      ? pow(max(0.0, NdotH), shininess)
      : 0.0 // Specular term in y
  );
}

void main(void ) {
  vec3 surfaceToLight = u_lightPosition.xyz - v_position.xyz;
  vec3 surfaceToView = (u_camMatrix[3] - u_world * v_position).xyz;
  vec3 normalN = normalize(v_normal);
  vec3 surfaceToLightN = normalize(surfaceToLight);
  vec3 surfaceToViewN = normalize(surfaceToView);
  vec3 halfVector = normalize(surfaceToLightN + surfaceToViewN);

  vec2 l = lightCalc(normalN, surfaceToLightN, halfVector, u_matShininess);

  vec4 diffuseColour = texture(u_matTexture, v_texCoord) * u_matDiffuse;

  outColour =
    u_ambientLight * diffuseColour * u_matAmbient +
    diffuseColour * max(l.x, 0.0) * u_lightColour +
    u_matSpecular * l.y * u_lightColour;
}
