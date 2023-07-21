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

  // parent div
  const parent = canvas.parentElement
  parent.style.width = `${w}px`
  parent.style.height = `${h}px`
}

resizeCanvas()
