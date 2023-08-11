// ===== hud.ts =========================================================
// A HTML based HUD for the game, this is a simple div for now
// Ben Coleman, 2023
// ======================================================================

import { Stats } from './stats.ts'
import { version } from '../../package.json'
import { Camera } from '../index.ts'

export class HUD {
  private hud: HTMLDivElement
  private canvas: HTMLCanvasElement
  private debugDiv: HTMLDivElement
  private loadingDiv: HTMLDivElement
  public debug = false

  constructor(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement
    if (!parent) throw new Error('💥 Canvas must have a parent element')

    this.canvas = canvas

    this.hud = document.createElement('div')
    this.hud.classList.add('gsots3d-hud')
    this.hud.style.pointerEvents = 'none'

    this.updateWithCanvas = this.updateWithCanvas.bind(this)
    window.addEventListener('resize', this.updateWithCanvas)
    window.addEventListener('load', this.updateWithCanvas)

    this.debugDiv = document.createElement('div')
    this.debugDiv.classList.add('gsots3d-debug')
    this.debugDiv.style.fontSize = 'min(1.5vw, 20px)'
    this.debugDiv.style.fontFamily = 'monospace'
    this.debugDiv.style.color = 'white'
    this.debugDiv.style.padding = '1vw'
    this.addHUDItem(this.debugDiv)

    this.loadingDiv = document.createElement('div')
    this.loadingDiv.classList.add('gsots3d-loading')
    this.loadingDiv.innerHTML = `💾 Loading...<br><br><div style='font-size:1.5vw'>GSOTS-3D v${version}</div>`
    this.loadingDiv.style.font = 'normal 3vw sans-serif'
    this.loadingDiv.style.color = '#ccc'
    this.loadingDiv.style.position = 'absolute'
    this.loadingDiv.style.top = '50%'
    this.loadingDiv.style.left = '50%'
    this.loadingDiv.style.textAlign = 'center'
    this.loadingDiv.style.transform = 'translate(-50%, -50%)'
    this.addHUDItem(this.loadingDiv)

    parent.appendChild(this.hud)
    this.updateWithCanvas()
  }

  private updateWithCanvas() {
    const canvasStyles = window.getComputedStyle(this.canvas, null)
    this.hud.style.position = canvasStyles.getPropertyValue('position')
    this.hud.style.top = canvasStyles.getPropertyValue('top')
    this.hud.style.left = canvasStyles.getPropertyValue('left')
    this.hud.style.width = canvasStyles.getPropertyValue('width')
    this.hud.style.height = canvasStyles.getPropertyValue('height')
    this.hud.style.transform = canvasStyles.getPropertyValue('transform')
  }

  addHUDItem(item: HTMLElement) {
    this.hud.appendChild(item)
  }

  render(debug = false, camera: Camera) {
    // Draw the debug HUD
    if (debug) {
      this.debugDiv.innerHTML = `
        <b>GSOTS-3D v${version}</b><br><br>
        <b>Camera: </b>${camera.toString()}<br>
        <b>Instances: </b>${Stats.instances}<br>
        <b>Draw calls: </b>${Stats.drawCallsPerFrame}<br>
        <b>Triangles: </b>${Stats.triangles}<br>
        <b>Render: </b>FPS: ${Stats.FPS} / ${Stats.totalTimeRound}s<br>
      `
    } else {
      this.debugDiv.innerHTML = ''
    }
  }

  hideLoading() {
    this.loadingDiv.style.display = 'none'
  }
}
