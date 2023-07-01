// =============================================================
// Fragment shader for billboarded sprites, with transparency
// =============================================================

precision highp float;

varying vec2 v_texCoord;
varying vec4 v_position;

// Common uniforms
uniform mat4 u_world;

// Texture uniforms
uniform sampler2D u_texture;

void main(void) {
  vec4 texel = texture2D(u_texture, v_texCoord);

  // Magic to make transparent sprites work, without blending 
  if(texel.a < 0.5) {
    discard;
  }

  gl_FragColor = texel;
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
