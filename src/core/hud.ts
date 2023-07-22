// ===== hud.ts =========================================================
// A HTML based HUD for the game, this is a simple div for now
// Ben Coleman, 2023
// ======================================================================

export class HUD {
  private hud: HTMLDivElement
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement
    if (!parent) throw new Error('💥 Canvas must have a parent element')

    this.canvas = canvas

    this.hud = document.createElement('div')
    this.hud.classList.add('gsots3d-hud')

    this.update = this.update.bind(this)
    window.addEventListener('resize', this.update)

    parent.appendChild(this.hud)
    this.update()
  }

  update() {
    const canvasStyles = window.getComputedStyle(this.canvas, null)
    this.hud.style.position = canvasStyles.getPropertyValue('position')
    this.hud.style.top = canvasStyles.getPropertyValue('top')
    this.hud.style.left = canvasStyles.getPropertyValue('left')
    this.hud.style.width = canvasStyles.getPropertyValue('width')
    this.hud.style.height = canvasStyles.getPropertyValue('height')
    this.hud.style.transform = canvasStyles.getPropertyValue('transform')

    // IMPORTANT: This is needed to make the canvas clickable for pointer lock
    this.hud.style.pointerEvents = 'none'
  }

  addHUDItem(item: HTMLElement) {
    this.hud.appendChild(item)
  }

  debug(msg: string) {
    this.hud.innerHTML = msg
  }
}
