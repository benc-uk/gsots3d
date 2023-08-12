#version 300 es

// ============================================================================
// Particle update vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec3 position;
in vec3 velocity;
in float age;

uniform float u_time;
uniform float u_deltaTime;
uniform float u_maxAge;
uniform float u_speed;

out vec3 tf_position;
out vec3 tf_velocity;
out float tf_age;

float random(vec2 p) {
  vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
  );
  return fract(cos(dot(p, K1)) * 12345.6789);
}

void main() {
  tf_age = age + u_deltaTime;
  tf_velocity = velocity;
  tf_position = position + tf_velocity * u_deltaTime * u_speed;

  if (tf_age > u_maxAge) {
    tf_position = vec3(0.0);
    tf_velocity = vec3(velocity.x, velocity.y, velocity.z);
    tf_age = random(vec2(velocity.x, velocity.y)) * u_maxAge * 0.2;
  }
}
