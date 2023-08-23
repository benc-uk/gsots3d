import { Context, setLogLevel, Physics, Tuples, Model } from '../../dist-bundle/gsots3d.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js'

const ctx = await Context.init()
ctx.camera.position = [50, 80, 60]
ctx.camera.enableFPControls(0.8, -0.49, 0.0015, 1.8)
ctx.camera.far = 300
ctx.camera.fov = 43
ctx.debug = true
setLogLevel('info')

ctx.globalLight.setAsPosition(5, 6, 3)
const amb = 0.2
ctx.globalLight.ambient = [amb, amb, amb]
ctx.globalLight.enableShadows({
  zoom: 70,
  mapSize: 2048,
  polygonOffset: 0.2,
  distance: 100,
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

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -4.8, 0) })

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

const startDiceCount = 70
const diceBodies = []
const diceInstances = []
for (let d = 0; d < startDiceCount; d++) {
  setTimeout(() => {
    addDice()
  }, 50 * d)
}

ctx.physicsWorld = world
ctx.update = (delta, now) => {
  for (let d = 0; d < diceBodies.length; d++) {
    const dice = diceInstances[d]
    const diceBody = diceBodies[d]

    dice.position = Tuples.fromCannon(diceBody.position)
    dice.setQuaternion(Tuples.fromCannon(diceBody.quaternion))
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'z') {
    addDice()
  }
})

ctx.start()

function addDice() {
  const dice = ctx.createModelInstance('dice')
  dice.position = [-30 + Math.random() * 60, 70 + Math.random() * 40, -20 + Math.random() * 40]
  dice.rotateX((Math.PI / 2) * Math.random())
  dice.rotateY((Math.PI / 2) * Math.random())
  dice.rotateZ((Math.PI / 2) * Math.random())
  dice.scale = [2.5, 2.5, 2.5]

  const diceBody = new CANNON.Body({
    mass: 0.005,
    position: new CANNON.Vec3(dice.position[0], dice.position[1], dice.position[2]),
    quaternion: new CANNON.Quaternion(dice.quaternion[0], dice.quaternion[1], dice.quaternion[2], dice.quaternion[3]),
    shape: new CANNON.Box(new CANNON.Vec3(2.5, 2.5, 2.5)),
    material: diceMat,
  })
  diceBody.angularVelocity.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
  world.addBody(diceBody)

  diceBodies.push(diceBody)
  diceInstances.push(dice)
}
