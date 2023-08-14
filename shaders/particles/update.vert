#version 300 es

// ============================================================================
// Particle update vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec3 position;
in vec3 velocity;
in float age;
in float lifetime;
in float seed;

uniform float u_time;
uniform float u_deltaTime;
uniform sampler2D u_randTex;
uniform float u_maxInstances;
uniform vec2 u_lifetimeMinMax;
uniform vec2 u_powerMinMax;
uniform vec3 u_gravity;
uniform vec3 u_direction1;
uniform vec3 u_direction2;
uniform float u_timeScale;

out vec3 tf_position;
out vec3 tf_velocity;
out float tf_age;
out float tf_lifetime;

vec4 rand(float offset) {
  float u = float(gl_VertexID) / u_maxInstances + offset;
  return texture(u_randTex, vec2(u)).rgba;
}

float randBetween(float min, float max, float offset) {
  vec4 r = rand(offset);
  return min + (max - min) * r.w;
}

void main() {
  float newAge = age + u_deltaTime * u_timeScale;

  tf_age = newAge;
  tf_velocity = velocity + u_gravity * u_deltaTime * u_timeScale;
  tf_position = position + tf_velocity * u_deltaTime * u_timeScale;
  tf_lifetime = lifetime;

  // Dead particles are respawned
  if (newAge > lifetime) {
    tf_age = 0.0;
    tf_position = vec3(0.0);

    vec4 r = rand(seed);
    float power = randBetween(u_powerMinMax.x, u_powerMinMax.y, 0.0);

    tf_velocity = vec3(
      randBetween(u_direction1.x, u_direction2.x, r.x) * power,
      randBetween(u_direction1.y, u_direction2.y, r.y) * power,
      randBetween(u_direction1.z, u_direction2.z, r.z) * power
    );

    tf_lifetime = randBetween(u_lifetimeMinMax.x, u_lifetimeMinMax.y, seed);
  }
}
