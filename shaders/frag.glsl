precision highp float;

varying vec3 v_lighting;
varying vec2 v_texCoord;

uniform vec4 u_matDiffuse;
uniform sampler2D u_matTexture;

void main(void) {
  vec4 diffuseColor = texture2D(u_matTexture, v_texCoord);
  gl_FragColor = vec4(diffuseColor * u_matDiffuse) * vec4(v_lighting, 1.0);
}
