# 🎨 GSOTS-3D

<img src="https://code.benco.io/gsots3d/icon.png" align="left" width="120px"/>

A library for _Getting S\*\*t On The Screen in 3D_  
So you can get cool looking 3D stuff happening in your browser, if that's your thing.

This library is an opinionated set of abstractions and wrappers around WebGL & twgl. GSOTS takes the pain out of the process of loading models, defining a camera, rendering a scene, lighting etc. It is based on the classic Blinn-Phong shading model, rather than the more modern PBR based shaders.

Features

- Models: Meshes with loading & parsing of OBJ & MTL.
- Materials with diffuse texture mapping, specular maps.
- Lights: directional (global) and dynamic point lights.
- Primitives: sphere, cube, plane.
- Rendering: Phong and flat-Gouraud shading modes.
- Transparency: With limitations.
- Billboarding for adding 2D sprites into a 3D scene.
- Camera: Perspective and orthographic.

## 🕹️ Demos & Samples

### [Live demos](./examples/)

### [Example code](https://github.com/benc-uk/gsots3d/tree/main/examples)

## 🖼️ Screenshots

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/253817000-93846b97-35a8-4fa5-bd79-c4a24176b6df.png)

![screenshot of some teapots!](https://user-images.githubusercontent.com/14982936/253750405-8c9aba84-fa42-4c52-9813-6d5255c3254b.png)

![screenshot of treasure chest](https://user-images.githubusercontent.com/14982936/253808708-32c89ca7-ad08-4c26-9de1-2964aa32a0a2.png)


## 💬 Hello World - Example

The hello world equivalent in GSOTS is putting a simple object on the screen, This example creates a GSOTS `Context` to render a simple red sphere

```html
<html>
  <body>
    <!-- This canvas will be used for rendering -->
    <canvas width="800" height="600"></canvas>

    <script type="module">
      import { Context, Material } from './gsots3d.js'

      // Create rendering context
      const gsots = await Context.init('canvas')

      // Create a red sphere of radius 5 at the origin
      gsots.createSphereInstance(Material.RED, 5.0)

      // Start and render into the canvas
      gsots.start()
    </script>
  </body>
</html>
```

## Using & Install

#### Import as package

The NPM package is published on [GitHub Packages](https://github.com/benc-uk/gsots3d/pkgs/npm/gsots3d), to install the package, simply run:

```bash
echo "@benc-uk:registry=https://npm.pkg.github.com" >> .npmrc
npm install @benc-uk/gsots3d
```

#### Directly in browser

A standalone ESM bundle is delivered via jsDelivr & GitHub, this can be used directly in a vanilla HTML+JS app to import the library, e.g.

```js
// Import from main, getting latest code
import { Context } from 'https://cdn.jsdelivr.net/gh/benc-uk/gsots3d@main/dist-bundle/gsots3d.min.js'
```

If you want to reference a specific released version you can do so by changing `benc-uk/gsots3d@main` for example `benc-uk/gsots3d@0.0.1`

## 🤔 Known Issues

- Transparency
  - Is a bit of a hack and instances/objects are not sorted
  - Works OK with primitives, you can override a OBJ model material with a transparent one, but results might not be great.
- Billboards: Shading on spherical billboards might not be correct

## 📝 Documentation

[Full API reference](https://code.benco.io/gsots3d/docs/)

[GitHub Project](https://github.com/benc-uk/gsots3d)
