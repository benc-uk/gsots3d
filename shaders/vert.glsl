precision highp float;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_lightAmbient;

attribute vec4 position;
attribute vec3 normal;
attribute vec4 color;

// varying to pass to fragment shader
varying vec3 v_lighting;
varying vec4 v_color;

void main() {
  vec4 worldPos = u_world * position;
  float distance = length(u_lightPosition - worldPos.xyz) * 0.06;
  vec3 lightVector = normalize(u_lightPosition - worldPos.xyz);
  vec4 normalWorld = u_worldInverseTranspose * vec4(normal, 1.0);
  float intensity = clamp(dot(normalWorld.xyz, lightVector), 0.0, 0.8);

  v_lighting = u_lightAmbient + (u_lightColor * (intensity / (distance * distance)));
  //v_lighting = u_lightAmbient + (u_lightColor * intensity);
  v_color = color;
  gl_Position = u_worldViewProjection * position;
}