# 🎨 GSOTS-3D

A library for *Getting S&ast;&ast;t On The Screen in 3D*

An opinionated set of abstractions and wrappers around twgl and WebGL APIs to make it easy to get 3D stuff happening in your browser.

Features
- Model meshes, with loading & parsing of OBJ with MTL
- Primitives; sphere, cube, plane
- Phong and Gouraud shaders
- Texture mapping
- Camera modes
- Multiple lights (one actually)

## 📝 Documentation

[Full API reference documents are here](https://code.benco.io/gsots3d/docs/)

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

    // Create a red sphere of radius 5
    gsots.createSphereInstance(Material.RED, 5.0)

    // Start!
    gsots.start()
  </script>
</body>
</html>
```

## Using & Install

#### Import as package

The NPM package is published on [GitHub Packages](https://docs.github.com/en/packages), to install the package, simply run:

```bash
echo "@benc-uk:registry=https://npm.pkg.github.com" >> .npmrc
npm install @benc-uk/gsots3d
```

#### Directly in browser

A standalone ESM bundle is published via jsDelivr & GitHub, this can be used directly in a vanilla HTML+JS app to import the library, e.g.

```js
import { Context } from 'https://cdn.jsdelivr.net/gh/benc-uk/gsots3d@main/dist-bundle/gsots3d.min.js'
```

If you want to reference a specific version you can do so by changing `benc-uk/gsots3d@main` for example `benc-uk/gsots3d@0.0.2` 


## 🕹️ Demos & Samples

### [Set of Examples & Samples](https://code.benco.io/gsots3d/examples/)

## 🖼️ Example Screens

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/252045019-ae3555c8-4ac1-4b1a-9ff8-b8fb7efa30ff.png)
