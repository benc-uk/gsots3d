import { DEG_90, TILESZ, ZONE_SIZE } from './consts.mjs'
import { Instance, getModel } from './models.mjs'

/**
 * Zone holds the playing area & tiles the player is currently in
 */
export class Zone {
  /**  @type {Tile[][]} */
  tiles = []

  /**
   * Creates an instance of Zone.
   *
   * @param {number} width - Width of room in tiles
   * @param {number} height - Height of room in tiles
   */
  constructor(width, height) {
    this.width = width
    this.height = height

    this.tiles = new Array(ZONE_SIZE)

    for (let x = 0; x < ZONE_SIZE; x++) {
      this.tiles[x] = new Array(ZONE_SIZE)
      for (let y = 0; y < ZONE_SIZE; y++) {
        this.tiles[x][y] = new Tile(x, y)
      }
    }

    for (let x = 1; x < width + 1; x++) {
      for (let y = 1; y < height + 1; y++) {
        this.tiles[x][y].impassable = false
        this.tiles[x][y].wall = false
      }
    }
  }

  /**
   * Creates instances of the models needed to render the room
   *
   * @returns {Instance[]} - List of instances that make up the room
   */
  buildInstances() {
    /** @type {Instance[]} */
    const instances = []
    const doorModel = getModel('door')
    const blockModel = getModel('block')
    const floorModel = getModel('floor')

    // add all the floor tiles from the room
    for (let x = 0; x < ZONE_SIZE; x++) {
      for (let y = 0; y < ZONE_SIZE; y++) {
        if (!this.tiles[x][y].wall) {
          const floorInstance = new Instance(floorModel, [x * TILESZ, -9, y * TILESZ])
          floorInstance.rotateX(DEG_90)
          instances.push(floorInstance)
        }
      }
    }

    // add all the walls from the room
    for (let x = 0; x < ZONE_SIZE; x++) {
      for (let y = 0; y < ZONE_SIZE; y++) {
        if (this.tiles[x][y].isExit()) {
          const doorInstance = new Instance(doorModel, [x * TILESZ + 8, 0, y * TILESZ])
          const wallInstanceTop = new Instance(blockModel, [x * TILESZ + 6, TILESZ, y * TILESZ])
          wallInstanceTop.scale = [1, 1, 0.5]
          wallInstanceTop.rotateY(DEG_90)
          doorInstance.rotateY(DEG_90)
          instances.push(doorInstance, wallInstanceTop)
        }

        if (!this.tiles[x][y].wall && !this.tiles[x][y].isExit()) {
          if (x === 0 || this.tiles[x - 1][y].wall) {
            const wallInstance = new Instance(blockModel, [(x - 1) * TILESZ + 6, 0, y * TILESZ])
            const wallInstanceTop = new Instance(blockModel, [(x - 1) * TILESZ + 6, TILESZ, y * TILESZ])
            wallInstance.rotateY(DEG_90)
            wallInstanceTop.rotateY(DEG_90)
            wallInstance.scale = [1, 1, 0.5]
            wallInstanceTop.scale = [1, 1, 0.5]
            instances.push(wallInstance, wallInstanceTop)
          }

          if (y === 0 || this.tiles[x][y - 1].wall) {
            const wallInstance = new Instance(blockModel, [x * TILESZ, 0, (y - 1) * TILESZ + 6])
            const wallInstanceTop = new Instance(blockModel, [x * TILESZ, TILESZ, (y - 1) * TILESZ + 6])
            wallInstance.scale = [0.9999, 1, 0.5]
            wallInstanceTop.scale = [0.9999, 1, 0.5]
            instances.push(wallInstance, wallInstanceTop)
          }
        }
      }
    }

    return instances
  }
}

/**
 * Tile holds the data for a single tile in the room
 */
export class Tile {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.impassable = true
    this.exit = null
    this.wall = true
  }

  floor() {
    this.wall = false
    this.impassable = false
  }

  isExit() {
    return this.exit !== null
  }

  setExit(targetZone, targetX, targetY) {
    this.exit = new Exit(targetZone, targetX, targetY)
    this.wall = false
  }
}

/**
 * Exit represents a door between two zones
 */
export class Exit {
  constructor(targetZone, targetX, targetY) {
    this.targetZone = targetZone
    this.targetX = targetX
    this.targetY = targetY
  }
}
