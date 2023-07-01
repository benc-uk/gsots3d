precision highp float;

varying vec3 v_lighting;
varying vec2 v_texCoord;

uniform vec3 u_matDiffuse;
uniform float u_transparency;

void main(void) {
  gl_FragColor = vec4(u_matDiffuse, 1.0) * vec4(v_lighting, 1.0);
  gl_FragColor.a = u_transparency;
}
