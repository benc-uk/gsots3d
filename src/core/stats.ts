// ===== stats.ts =======================================================
// Global singleton for keeping track of stats, timers performance
// Ben Coleman, 2023
// ======================================================================

export const Stats = {
  drawCallsPerFrame: 0,
  instances: 0,
  triangles: 0,

  prevTime: 0,
  deltaTime: 0,
  totalTime: 0,
  frameCount: 0,

  resetPerFrame() {
    Stats.drawCallsPerFrame = 0
  },

  updateTime(now: number) {
    Stats.deltaTime = now - Stats.prevTime // Get smoothed time difference
    Stats.prevTime = now
    Stats.totalTime += Stats.deltaTime
  },

  get FPS() {
    return Math.round(1 / Stats.deltaTime)
  },

  get totalTimeRound() {
    return Math.round(Stats.totalTime)
  },
}
