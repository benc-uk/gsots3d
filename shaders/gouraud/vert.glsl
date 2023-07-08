precision highp float;

varying vec4 v_colour;

uniform mat4 u_world;
uniform mat4 u_camMatrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

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

// Attributes from buffers
attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

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
    (NdotL > 0.0) ? pow(max(0.0, NdotH), shininess) : 0.0 // Specular term in y
  );
}

void main(void) {
  vec3 worldNormal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  vec4 worldPos = u_world * position;
  
  vec3 surfaceToLight = u_lightPosition.xyz - worldPos.xyz;
  vec3 surfaceToView = (u_camMatrix[3] - (u_world * worldPos)).xyz;
  vec3 normalN = normalize(worldNormal);
  vec3 surfaceToLightN = normalize(surfaceToLight);
  vec3 surfaceToViewN = normalize(surfaceToView);
  vec3 halfVector = normalize(surfaceToLightN + surfaceToViewN);

  vec2 light = lightCalc(normalN, surfaceToLightN, halfVector, u_matShininess);

  vec4 diffuseColour = texture2D(u_matTexture, texcoord) * u_matDiffuse;

  // Output colour is sum of ambient, diffuse and specular components
  v_colour = (u_ambientLight * diffuseColour * u_matAmbient)
  + (diffuseColour * u_lightColour * max(light.x, 0.0))
  + (u_lightColour * u_matSpecular * light.y); 

  gl_Position = u_worldViewProjection * position;
}
