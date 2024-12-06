//
// Common code for screen resing and fullscreen
//

let canvas: HTMLCanvasElement
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export function initResizer(can: HTMLCanvasElement | undefined | null) {
  if (!can) {
    throw new Error('💥 Canvas element not found')
  }

  canvas = can

  window.onresize = function () {
    resizeCanvas()
  }

  window.addEventListener('load', function () {
    resizeCanvas()
  })

  window.ondblclick = function () {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      canvas.parentElement?.requestFullscreen()
    }
  }
}

// Aspect ratio aware resize
export function resizeCanvas() {
  // respect the aspect ratio
  let w = window.innerWidth
  let h = window.innerHeight
  const ratio = canvas.width / canvas.height

  // enforce ratios
  if (w / h > ratio) {
    w = h * ratio
  } else {
    h = w / ratio
  }

  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}
