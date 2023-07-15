# 🎨 GSOTS-3D

<img src="etc/site/icon.png" align="left" width="120px"/>

A library for _Getting S\*\*t On The Screen in 3D_  
So you can get cool looking 3D stuff happening in your browser, if that's your thing.

This library is an opinionated set of abstractions and wrappers around WebGL & twgl. GSOTS takes the pain out of the process of loading models, defining a camera, rendering a scene, lighting etc.

Features

- Models: Meshes with loading & parsing of OBJ & MTL
- Materials with texture mapping, specular maps
- Lights: directional (global) and multiple point lights
- Primitives: sphere, cube, plane
- Rendering: Phong and flat-Gouraud shading modes
- Camera: Perspective and orthographic

## 📝 Documentation

[Full API reference](./docs/)

[GitHub Project](https://github.com/benc-uk/gsots3d)

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

## 🕹️ Demos & Samples

### [Live demos](./examples/)

### [Example code](https://github.com/benc-uk/gsots3d/tree/main/examples)

## 🖼️ Screenshots

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/253750428-60a25ac3-e4e4-4eeb-b863-08d31248ab00.png)

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/253750405-8c9aba84-fa42-4c52-9813-6d5255c3254b.png)

