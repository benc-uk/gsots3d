# 🎨 GSOTS-3D

<img src="https://code.benco.io/gsots3d/icon.png" align="left" width="120px"/>

A library for _Getting Stuff On The Screen_ in 3D  
So you can get cool looking 3D things happening in your browser, with hopefully minimal effort.

This library is an opinionated set of abstractions and wrappers around WebGL & [twgl.js](https://twgljs.org/). GSOTS takes the pain out of loading models, defining a camera, rendering a scene, lighting etc. It is based on the classic Blinn-Phong shading model, rather than the more modern PBR based shaders, because I'm old.

Feature Set:

- **🗿 Models**: Loading, parsing & rendering of meshes and multi-part objects from OBJ & MTL files.
- **✨ Materials**: With diffuse texture mapping, specular maps & normal/bump mapping.
- **🪩 Environment mapping**: Scene based reflections, skyboxes & dynamic realtime reflections
- **🔦 Lights**: Global directional and dynamic point lights.
- **📍 Nodes**: Hierarchical node system for instances and grouping.
- **📦 Primitives**: Sphere, cube, plane.
- **🎆 Particles**: GPU based particle system.
- **💧 Transparency**: Transparent materials & primitives 
- **🌑 Shadows**: Realtime shadows from directional light sources.
- **💖 Reflection**: Both dynamic and static environment mapping.
- **⚖️ Physics**: Helpers to integrate with with [cannon-es](https://pmndrs.github.io/cannon-es/) physics engine.
- **🪧 Billboarding**: For adding 'flat' 2D sprites into the 3D scene.
- **🎥 Camera**: Perspective and orthographic projection, and first person mouse & keyboard controls

## 🕹️ Demos & Samples

### [Live Demos](https://code.benco.io/gsots3d/examples/) - These work in your browser!

## 🖼️ Screenshots

![Some room in a dungeon or something](https://user-images.githubusercontent.com/14982936/260514854-e96ed8d1-a498-459b-bef3-58b6612cc3cf.png)

![normal mapping and environment mapping](https://user-images.githubusercontent.com/14982936/260514818-0ab70843-5485-4f29-aea9-585367137245.png)

![Particle system](https://user-images.githubusercontent.com/14982936/260514449-0e9dac87-9bdf-4712-aa9a-8fa952158459.png)

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

## 💻 Using & Install

#### Import as package

The NPM package is published on [GitHub Packages](https://github.com/benc-uk/gsots3d/pkgs/npm/gsots3d), to install the package, simply run:

```bash
echo "@benc-uk:registry=https://npm.pkg.github.com" >> .npmrc
npm install @benc-uk/gsots3d
```

#### Directly in browser

A standalone ESM single file bundle is delivered via jsDelivr & GitHub, this can be used directly in a vanilla HTML+JS app to import the library, e.g.

```js
// Import from main, getting latest code
import { Context } from 'https://cdn.jsdelivr.net/gh/benc-uk/gsots3d@main/dist-single/gsots3d.min.js'
```

If you want to reference a specific released version you can do so by changing `benc-uk/gsots3d@main` for example `benc-uk/gsots3d@0.0.4`

## 📦 Supported Models & Textures

OBJ files can be parsed and loaded, MTL files will be loaded and materials parsed when referenced from the OBJ, and and OBJ can consist of multiple materials. When parsing the OBJ the UV texture coordinates are flipped in the Y direction, this makes them consistent with the rest of the rendering internally.

Normal maps will be parsed from any MTL (or can added to a *Material* with `addNormalTexture()`) using the unofficial `map_bump` keyword. 

Normal maps must be in OpenGL format, i.e. Y+ or "green at top", see this [reference image](https://doc.babylonjs.com/img/how_to/Materials/normal_maps1.jpg)

Due to the vast inconsistencies in OBJ & MTL exporting from the thousands of software packages and tools out there (and the age of the format), it's fairly unlikely any OBJ you download or export will work without some modification, often to just the MTL file.

## 🤔 Known Limitations & Issues

- Transparency
  - Works OK with primitives, you can override a OBJ model material with a transparent one, but results might not be great.
- Billboards: Shading on spherical billboards might not be correct
- OBJ & MTL: The parsers are far from comprehensive and may not handle all features
- Due to the performance overhead only a single dynamic environment map is supported 
- Shadow mapping follows the active camera by default in a not very good way
- Particle system: The emitter source is limited to a cuboid shape

## 📝 Documentation & Links

### [Full API Reference Guide](https://code.benco.io/gsots3d/docs/)

### [Link to GitHub Project](https://github.com/benc-uk/gsots3d)

## 📚 Sources & Reading

- https://learnopengl.com/
- https://twgljs.org/
- https://webglfundamentals.org/
- https://github.com/benc-uk/doom-lite