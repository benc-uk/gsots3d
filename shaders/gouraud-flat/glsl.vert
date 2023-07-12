#version 300 es

// ============================================================================
// Gouraud vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

// Input attributes from buffers
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 u_world;
uniform mat4 u_camMatrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// Material properties
uniform vec4 u_matAmbient;
uniform vec4 u_matSpecular;
uniform float u_matShininess;

// Light properties
uniform vec4 u_lightPosition;
uniform vec4 u_lightColour;
uniform vec4 u_ambientLight;

flat out vec4 v_lightingDiffuse;
flat out vec4 v_lightingSpecular;
out vec2 v_texCoord;

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

void main() {
  vec3 worldNormal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  vec4 worldPos = u_world * position;

  vec3 surfaceToLight = u_lightPosition.xyz - worldPos.xyz;
  vec3 surfaceToView = (u_camMatrix[3] - u_world * worldPos).xyz;
  vec3 normalN = normalize(worldNormal);
  vec3 surfaceToLightN = normalize(surfaceToLight);
  vec3 surfaceToViewN = normalize(surfaceToView);
  vec3 halfVector = normalize(surfaceToLightN + surfaceToViewN);

  vec2 l = lightCalc(normalN, surfaceToLightN, halfVector, u_matShininess);

  // Output lighting value for fragment shader to use, no color
  v_lightingDiffuse = u_ambientLight * u_matAmbient + u_lightColour * max(l.x, 0.0);

  // Pass specular in a seperate varying
  v_lightingSpecular = u_lightColour * u_matSpecular * l.y;

  // Pass through varying texture coordinate, so we can get the colour there
  v_texCoord = texcoord;

  gl_Position = u_worldViewProjection * position;
}
