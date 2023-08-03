// Needed to stop TypeScript from complaining about importing GLSL files

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}
