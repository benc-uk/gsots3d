#version 300 es

// ============================================================================
// Particle render vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position;
in vec2 texcoord;
in vec3 tf_position;
in float tf_age;
in float tf_lifetime;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat4 u_world;

out vec2 v_texcoord;
out vec3 v_position;
out float v_ageNorm;

void main() {
  vec4 world_pos = u_world * vec4(tf_position, 1.0);
  vec4 view_pos = u_view * world_pos;

  // Billboarding magic
  gl_Position = u_proj * (view_pos + vec4(position.xy, 0.0, 0.0));

  v_ageNorm = tf_age / tf_lifetime;

  v_position = world_pos.xyz;
  v_texcoord = texcoord;
}
