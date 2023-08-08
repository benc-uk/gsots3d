// ===== stats.ts =======================================================
// Global singleton for keeping track of stats, timers performance
// Ben Coleman, 2023
// ======================================================================

export class Stats {
  public static drawCallsPerFrame = 0
  public static instances = 0
  public static triangles = 0

  private static prevTime = 0
  public static deltaTime = 0
  public static totalTime = 0

  static resetPerFrame() {
    Stats.drawCallsPerFrame = 0
  }

  static updateTime(now: number) {
    Stats.deltaTime = now - Stats.prevTime // Get smoothed time difference
    Stats.prevTime = now
    Stats.totalTime += Stats.deltaTime
  }

  static get FPS() {
    return Math.round(1 / Stats.deltaTime)
  }

  static get totalTimeRound() {
    return Math.round(Stats.totalTime)
  }
}
