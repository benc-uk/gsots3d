//
// Common code for all examples & samples
//

const canvas = document.querySelector('canvas')
// Internal resolution
const ratio = canvas.width / canvas.height

window.onresize = function () {
  resizeCanvas()
}

window.onload = function () {
  resizeCanvas()
}

// Fullscreen mode when double clicking
window.ondblclick = function () {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    canvas.parentElement.requestFullscreen()
  }
}

// Aspect ratio aware resize
function resizeCanvas() {
  let w = window.innerWidth
  let h = window.innerHeight

  // Enforce aspect ratio
  if (w / h > ratio) {
    w = h * ratio
  } else {
    h = w / ratio
  }

  // Set at CSS/HTML level not the canvas width/height
  // This will potentially stretch/squash the canvas
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

resizeCanvas()
