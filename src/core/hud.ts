export class HUD {
  private hud: HTMLDivElement

  constructor(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement
    if (!parent) throw new Error('💥 Canvas must have a parent element')

    this.hud = document.createElement('div')
    this.hud.style.position = 'absolute'
    this.hud.style.top = '0'
    this.hud.style.left = '0'
    this.hud.style.width = '100%'
    this.hud.style.height = '100%'
    this.hud.style.color = '#fff'
    this.hud.style.pointerEvents = 'none'

    this.hud.classList.add('gsots3d-hud')

    parent.appendChild(this.hud)
  }

  addHUDItem(item: HTMLElement) {
    this.hud.appendChild(item)
  }

  debug(msg: string) {
    this.hud.innerHTML = msg
  }
}
