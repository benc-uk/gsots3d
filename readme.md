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

## 🕹️ Demos & Samples

### [Set of Examples & Samples](https://code.benco.io/gsots3d/examples/)

## 🖼️ Example Screens

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/252045019-ae3555c8-4ac1-4b1a-9ff8-b8fb7efa30ff.png)
