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
  fpsBucket: [] as number[],

  resetPerFrame() {
    Stats.drawCallsPerFrame = 0
  },

  updateTime(now: number) {
    Stats.deltaTime = now * 0.001 - Stats.prevTime // Get smoothed time difference
    Stats.prevTime = now * 0.001
    Stats.totalTime += Stats.deltaTime

    Stats.fpsBucket.push(Stats.deltaTime)
    if (Stats.fpsBucket.length > 10) {
      Stats.fpsBucket.shift()
    }
  },

  get FPS() {
    const sum = Stats.fpsBucket.reduce((a, b) => a + b, 0)
    return Math.round(1 / (sum / Stats.fpsBucket.length))
  },

  get totalTimeRound() {
    return Math.round(Stats.totalTime)
  },
}
