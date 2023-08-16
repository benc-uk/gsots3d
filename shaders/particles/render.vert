#version 300 es

// ============================================================================
// Particle render vertex shader
// Ben Coleman, 2023
// ============================================================================

precision highp float;

in vec4 position; // Vertex positions of the particle quad
in vec2 texcoord;
in vec4 tf_position; // Position of the particle
in vec2 tf_age;
in vec4 tf_props;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform mat4 u_world;

out vec2 v_texcoord;
out vec3 v_position;
out float v_ageNorm;

void main() {
  vec3 vert_pos = position.xyz;
  v_ageNorm = tf_age[0] / tf_age[1];

  // Rotate by tf_position[3] (rotation)
  float s = sin(tf_position[3]);
  float c = cos(tf_position[3]);
  mat2 rot = mat2(c, -s, s, c);
  vert_pos.xy = rot * position.xy;

  // Scale by tf_props[0] (size)
  vert_pos = vert_pos.xyz * tf_props[0];

  // Move to the world at the particle position
  vec4 world_pos = u_world * vec4(tf_position.xyz, 1.0);
  vec4 view_pos = u_view * world_pos;

  // Billboarding magic
  gl_Position = u_proj * (view_pos + vec4(vert_pos.xy, 0.0, 0.0));

  v_position = world_pos.xyz;
  v_texcoord = texcoord;
}
