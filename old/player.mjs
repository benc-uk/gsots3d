import { Zone } from './zone.mjs'
import { Sprite } from './sprites.mjs'
import { TILESZ } from './consts.mjs'

/** Player class, of which there is a single instance */
export class Player {
  /** @type {Sprite} */
  sprite

  /** @type {number[]} */
  position

  /** @type {Zone} */
  zone

  /** @type {Function} - Called when the */
  zoneChangeCallback

  constructor() {
    this.sprite = new Sprite('dwarf_1')
    this.position = [0, 0, 0]
  }

  /**
   * Move the player to a new zone
   *
   * @param {Zone} zone - Zone to move to
   */
  setZone(zone) {
    this.zone = zone
    this.zoneChangeCallback(zone)
  }

  /**
   * Set the position of the player in absolute world coordinates
   *
   * @param {number} x - x position
   * @param {number} y - y position
   * @param {number} z - z position
   */
  setPosition(x, y, z) {
    this.position = [x, y, z]
    this.sprite.position = [x, y, z]
  }

  /**
   * Set the position of the player in terms of tile coordinates
   *
   * @param {number} x - x position
   * @param {number} y - y position
   */
  setTilePosition(x, y) {
    this.setPosition(x * TILESZ, this.position[1], y * TILESZ)
  }

  move(dx, dy) {
    // room cells for collision detection
    const tiles = this.zone.tiles
    const newX = this.position[0] + dx
    const newY = this.position[2] + dy
    const collX = this.position[0] + dx * 2
    const collY = this.position[2] + dy * 2
    console.log(`### Move to ${newX}, ${newY}`)

    // check if the new position is a wall
    const cellX = Math.round(collX / TILESZ)
    const cellY = Math.round(collY / TILESZ)
    const targetCell = tiles[cellX][cellY]
    console.log(`### Cell is ${cellX}, ${cellY}`)

    if (targetCell.isExit()) {
      this.setZone(targetCell.exit?.targetZone)
      this.setPosition(targetCell.exit?.targetX * TILESZ, this.position[1], targetCell.exit?.targetY * TILESZ)
      return
    }

    if (targetCell.impassable) {
      return
    }

    this.setPosition(newX, this.position[1], newY)
  }
}
