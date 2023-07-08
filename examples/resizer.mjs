const canvas = document.querySelector('canvas')

window.onresize = function () {
  resizeCanvas()
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resizeCanvas()
