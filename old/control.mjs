import { Player } from './player.mjs'
import { getGl } from './utils.mjs'

const MOVE_SPEED = 4

/**
 * bindControls sets up the event listeners for the controls
 *
 * @param {Player} player - The player object
 * @param {object} cameraParam - The camera parameters
 * @param {boolean} retroMode - Whether to use retro mode
 */
export function bindControls(player, cameraParam, retroMode) {
  document.addEventListener('keydown', (event) => {
    const keyCode = event.code
    if (keyCode === 'KeyQ') {
      cameraParam.angle -= 0.06
    }

    if (keyCode === 'KeyE') {
      cameraParam.angle += 0.06
    }

    if (keyCode === 'KeyZ') {
      cameraParam.height -= 0.5
    }

    if (keyCode === 'KeyX') {
      cameraParam.height += 0.5
    }

    if (keyCode === 'Equal') {
      cameraParam.zoom -= 2
    }

    if (keyCode === 'Minus') {
      cameraParam.zoom += 2
    }

    if (keyCode === 'ArrowLeft') {
      // player.setPosition((player.position[0] -= 2), player.position[1], player.position[2])
      player.move(-MOVE_SPEED, 0)
    }

    if (keyCode === 'ArrowRight') {
      //player.setPosition((player.position[0] += 2), player.position[1], player.position[2])
      player.move(MOVE_SPEED, 0)
    }

    if (keyCode === 'ArrowUp') {
      player.move(0, -MOVE_SPEED)
    }

    if (keyCode === 'ArrowDown') {
      player.move(0, MOVE_SPEED)
    }

    if (keyCode === 'KeyR') {
      retroMode = !retroMode
      const gl = getGl()
      if (retroMode) {
        // @ts-ignore
        gl.canvas.classList.add('retro')
        gl.canvas.width = 1200 / 6
        gl.canvas.height = 900 / 6
      } else {
        // @ts-ignore
        gl.canvas.classList.remove('retro')
        gl.canvas.width = 1200
        gl.canvas.height = 900
      }
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
  })
}
