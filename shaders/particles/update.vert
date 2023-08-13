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

uniform float u_time;
uniform float u_deltaTime;
uniform sampler2D u_randTex;
uniform float u_maxInstances;
uniform vec2 u_lifetime;

out vec3 tf_position;
out vec3 tf_velocity;
out float tf_age;
out float tf_lifetime;

vec4 rand(float offset) {
  float u = float(gl_VertexID) / u_maxInstances + offset;
  return texture(u_randTex, vec2(u)).rgba;
}

void main() {
  float speedScale = 1.0;
  float newAge = age + u_deltaTime * speedScale;

  tf_age = newAge;
  tf_velocity = velocity + vec3(1.9, -4.0, 0.0) * u_deltaTime * speedScale;
  tf_position = position + tf_velocity * u_deltaTime * speedScale * 30.0;
  tf_lifetime = lifetime;

  // Dead particles are respawned
  if (newAge > lifetime) {
    vec4 r = rand(lifetime);
    tf_position = vec3(0.0);
    tf_velocity = vec3(r.x - 0.5, r.y + 4.0, r.z - 0.5);
    tf_age = 0.0;

    // Randomise lifetime between min and max
    tf_lifetime = u_lifetime.x + (u_lifetime.y - u_lifetime.x) * r.w;
  }
}
