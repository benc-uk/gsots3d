# GSOTS-3D

A library for *Getting S&ast;&ast;t On The Screen in 3D*

An opinionated set of abstractions and wrappers around twgl and WebGL to make it useful 

Features
- Models, with loading & parsing of OBJ with MTL
- Instancing of models
- Camera
- Multiple lights (one actually)
- Builtin shaders for standard rendering
- Rendering options

## Documentation

[Reference documents are here](https://code.benco.io/gsots3d/docs/)

## Hello World - Example

The hello world equivalent in GSOTS is putting a simple object on the screen, This example creates a GSOTS `Context` to render a simple red sphere

```ts
import { Context, Material} from 'gsots3d'

// Create rendering context with canvas HTML element
const gsots = await Context.init()

// Create a red sphere of radius 5
gsots.createSphereInstance(Material.RED, 5.0)

// Start rendering
gsots.start()
```

## Demos

- [Simple scene test 1](https://code.benco.io/gsots3d/examples/test-1/)

## Example Screens

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/251233104-d035beaf-c64e-4bb2-bc12-d0ff32084551.png)
