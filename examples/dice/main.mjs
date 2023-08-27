import { Context, Physics } from '../../dist-bundle/gsots3d.js'
import { isMobile } from '../screen.mjs'

import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js'

const ctx = await Context.init()
ctx.start()
ctx.debug = true

ctx.camera.position = [50, 80, 60]
ctx.camera.enableFPControls(0.8, -0.49, 0.0015, 1.8)
ctx.camera.far = 1300
ctx.camera.fov = 43

ctx.globalLight.setAsPosition(6, 9, 3)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  zoom: 150,
  mapSize: 2048,
  polygonOffset: 0.2,
  distance: 2000,
})

// Load models
try {
  await ctx.loadModel('../_objects', 'table.obj')
  await ctx.loadModel('../_objects/dice', 'dice.obj')
} catch (e) {
  console.error(e)
}

const table = ctx.createModelInstance('table')
table.scale = [0.7, 1.1, 1.2]
table.rotateXDeg(-90)

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -5, 0) })
world.allowSleep = true

const tableMaterial = new CANNON.Material()
const diceMat = new CANNON.Material()
world.addContactMaterial(
  new CANNON.ContactMaterial(tableMaterial, diceMat, {
    friction: 0.2,
    restitution: 0.6,
  })
)

const tableBody = Physics.createBoxBody(table, 0, 85, tableMaterial)
tableBody.position = new CANNON.Vec3(0, 0, 0)
world.addBody(tableBody)

const startDiceCount = 200
for (let d = 0; d < startDiceCount; d++) {
  setTimeout(() => {
    addDice()
  }, 40 * d)
}

ctx.physicsWorld = world
ctx.physicsTimeStep = isMobile() ? 1 / 120 : 1 / 60

const note = document.createElement('div')
note.innerHTML = 'Press space to drop a die!'
note.style.fontSize = '2vw'
note.style.textShadow = '3px 3px 2px rgba(0,0,0,0.8)'
note.style.position = 'absolute'
note.style.top = '0'
note.style.right = '10px'
ctx.hud.addHUDItem(note)

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    addDice()
  }
})

function addDice() {
  const dice = ctx.createModelInstance('dice')

  dice.position = [-30 + Math.random() * 60, 70 + Math.random() * 40, -20 + Math.random() * 40]
  dice.scale = [2.5, 2.5, 2.5]
  dice.rotateX((Math.PI / 2) * Math.random())
  dice.rotateY((Math.PI / 2) * Math.random())
  dice.rotateZ((Math.PI / 2) * Math.random())

  const diceBody = Physics.createBoxBody(dice, 0.05, 5, diceMat)
  diceBody.allowSleep = true
  diceBody.sleepTimeLimit = 4

  diceBody.angularVelocity.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
  world.addBody(diceBody)
}
