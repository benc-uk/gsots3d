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

Simple working example of creating a Context to render a simple OBJ model

```ts
import { Model, Context } from 'gsots3d'

// Create context with default canvas
const ctx = await Context.init()

// Load a model and add it to the scene
ctx.models.add(await Model.parse('./objects', 'table.obj'))
ctx.createInstance('table')

// Start rendering
ctx.start()
```

## Demos

- [Simple scene test 1](https://code.benco.io/gsots3d/examples/test-1/)

## Example Screens

![screenshot of example scene](https://user-images.githubusercontent.com/14982936/251233104-d035beaf-c64e-4bb2-bc12-d0ff32084551.png)
