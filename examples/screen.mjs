//
// Common code for all examples & samples
//

const canvas = document.querySelector('canvas')
const ratio = canvas.width / canvas.height

window.onresize = function () {
  resizeCanvas()
}

window.onload = function () {
  resizeCanvas()
}

window.ondblclick = function () {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    canvas.parentElement.requestFullscreen()
  }
}

// Aspect ratio aware resize
function resizeCanvas() {
  // respect the aspect ratio
  let w = window.innerWidth
  let h = window.innerHeight

  // enforce ratios
  if (w / h > ratio) {
    w = h * ratio
  } else {
    h = w / ratio
  }
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
}

resizeCanvas()
