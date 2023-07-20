class Stats {
  private prevTime = 0

  public drawCallsPerFrame = 0

  public instances = 0
  public triangles = 0

  public deltaTime = 0
  public totalTime = 0

  resetPerFrame() {
    this.drawCallsPerFrame = 0
  }

  updateTime(now: number) {
    this.deltaTime = now - this.prevTime // Get smoothed time difference
    this.prevTime = now
    this.totalTime += this.deltaTime
  }

  get FPS() {
    return Math.round(1 / this.deltaTime)
  }

  get totalTimeRound() {
    return Math.round(this.totalTime)
  }
}

// Global singleton
export const stats = new Stats()
