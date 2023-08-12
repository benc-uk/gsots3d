#version 300 es

// ============================================================================
// Particle render vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec3 tf_position;
in vec3 tf_velocity;
in float tf_age;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform float u_maxAge;
uniform float u_speed;

out vec4 v_color;

void main() {
  vec4 pos = u_worldViewProjection * vec4(tf_position, 1.0);

  float age = tf_age / u_maxAge;

  // fade out particles as they age
  // and color from yellow to red
  v_color = vec4(0.9, 0.9 - age, 0.0, 1.4 - age);

  // scale points based on distance from camera
  gl_PointSize = 500.0 / length(pos.xyz) * (1.4 - age);

  gl_Position = pos;
}
