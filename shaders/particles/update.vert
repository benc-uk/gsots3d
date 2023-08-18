#version 300 es

// ============================================================================
// Particle update vertex shader, for on GPU particle simulation
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position;
in vec3 velocity;
in vec2 age;
in vec4 props;
in float seed;

uniform float u_deltaTime;
uniform sampler2D u_randTex;
uniform float u_maxInstances;
uniform vec2 u_lifetimeMinMax;
uniform vec2 u_powerMinMax;
uniform vec3 u_gravity;
uniform vec3 u_direction1;
uniform vec3 u_direction2;
uniform float u_timeScale;
uniform vec2 u_sizeMinMax;
uniform vec2 u_initialRotationMinMax;
uniform vec2 u_rotationSpeedMinMax;
uniform bool u_enabled;
uniform vec3 u_emitterBoxMin;
uniform vec3 u_emitterBoxMax;
uniform float u_accel;
uniform vec3 u_posOffset;

out vec4 tf_position;
out vec3 tf_velocity;
out vec2 tf_age;
out vec4 tf_props;

vec4 rand(float offset) {
  float uv = float(gl_VertexID) / u_maxInstances + offset;
  return texture(u_randTex, vec2(uv)).rgba;
}

float randBetween(float min, float max, float offset) {
  vec4 r = rand(offset);
  return min + (max - min) * r.w;
}

// NOTES: TF varyings & packing
// * position[0,1,2] = current position
// * position[3] = rotation
// * age[0] = current age
// * age[1] = lifetime
// * props[0] = size
// * props[1] = rotation speed

void main() {
  float t = u_deltaTime;
  float new_age = age[0] + t;

  float rot = position[3] + props[1] * t;

  tf_velocity = velocity * u_accel + u_gravity * t;
  tf_position = vec4(position.xyz + tf_velocity * t, rot);
  tf_age[0] = new_age;
  tf_age[1] = age[1];
  tf_props = props;

  // Dead particles are respawned
  if (new_age > age[1] && u_enabled) {
    vec4 r = rand(seed);

    tf_age[0] = 0.0;
    tf_position[0] = randBetween(u_emitterBoxMin.x, u_emitterBoxMax.x, r.x) + u_posOffset.x;
    tf_position[1] = randBetween(u_emitterBoxMin.y, u_emitterBoxMax.y, r.y) + u_posOffset.y;
    tf_position[2] = randBetween(u_emitterBoxMin.z, u_emitterBoxMax.z, r.z) + u_posOffset.z;
    tf_position[3] = randBetween(u_initialRotationMinMax.x, u_initialRotationMinMax.y, seed);

    float power = randBetween(u_powerMinMax.x, u_powerMinMax.y, 0.0);

    tf_velocity = vec3(
      randBetween(u_direction1.x, u_direction2.x, r.x + position.x) * power,
      randBetween(u_direction1.y, u_direction2.y, r.y + position.y) * power,
      randBetween(u_direction1.z, u_direction2.z, r.z + position.z) * power
    );

    tf_age[1] = randBetween(u_lifetimeMinMax.x, u_lifetimeMinMax.y, seed + position.x);
    tf_props[0] = randBetween(u_sizeMinMax.x, u_sizeMinMax.y, seed + position.y);
    tf_props[1] = randBetween(u_rotationSpeedMinMax.x, u_rotationSpeedMinMax.y, seed);
  }
}
