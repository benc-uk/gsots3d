//
// Common code for all examples & samples
//

const canvas = document.querySelector('canvas')

window.onresize = function () {
  resizeCanvas()
}

window.ondblclick = function () {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    canvas.requestFullscreen()
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resizeCanvas()
