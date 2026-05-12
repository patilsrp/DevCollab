// server/src/utils/performanceMonitor.js

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      codeChanges: new Map(), // Track code change frequency per room
      cursorMoves: new Map(), // Track cursor move frequency per user
      messageRates: new Map(), // Track message rates per room
      roomActivity: new Map() // Track overall room activity
    };
    
    // Clean up old metrics every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  trackCodeChange(roomId, socketId) {
    const now = Date.now();
    const key = `${roomId}:${socketId}`;
    
    if (!this.metrics.codeChanges.has(key)) {
      this.metrics.codeChanges.set(key, []);
    }
    
    const changes = this.metrics.codeChanges.get(key);
    changes.push(now);
    
    // Keep only last 100 changes
    if (changes.length > 100) {
      changes.shift();
    }
    
    // Check if rate is too high (more than 10 changes per second)
    const recentChanges = changes.filter(t => now - t < 1000);
    if (recentChanges.length > 10) {
      console.warn(`High code change rate detected for ${socketId} in room ${roomId}`);
      return false; // Suggest rate limiting
    }
    
    return true;
  }
  
  trackCursorMove(roomId, socketId) {
    const now = Date.now();
    const key = `${roomId}:${socketId}`;
    
    if (!this.metrics.cursorMoves.has(key)) {
      this.metrics.cursorMoves.set(key, []);
    }
    
    const moves = this.metrics.cursorMoves.get(key);
    moves.push(now);
    
    // Keep only last 200 moves
    if (moves.length > 200) {
      moves.shift();
    }
    
    return true;
  }
  
  getMetrics(roomId) {
    const roomMetrics = {
      codeChangeRate: 0,
      cursorMoveRate: 0,
      messageRate: 0,
      activeUsers: 0
    };
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Calculate rates for the room
    for (const [key, changes] of this.metrics.codeChanges.entries()) {
      if (key.startsWith(roomId)) {
        const recentChanges = changes.filter(t => t > oneMinuteAgo);
        roomMetrics.codeChangeRate += recentChanges.length;
        if (recentChanges.length > 0) {
          roomMetrics.activeUsers++;
        }
      }
    }
    
    for (const [key, moves] of this.metrics.cursorMoves.entries()) {
      if (key.startsWith(roomId)) {
        const recentMoves = moves.filter(t => t > oneMinuteAgo);
        roomMetrics.cursorMoveRate += recentMoves.length;
      }
    }
    
    return roomMetrics;
  }
  
  cleanup() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // Clean up old entries
    for (const [key, changes] of this.metrics.codeChanges.entries()) {
      const recentChanges = changes.filter(t => t > fiveMinutesAgo);
      if (recentChanges.length === 0) {
        this.metrics.codeChanges.delete(key);
      } else {
        this.metrics.codeChanges.set(key, recentChanges);
      }
    }
    
    for (const [key, moves] of this.metrics.cursorMoves.entries()) {
      const recentMoves = moves.filter(t => t > fiveMinutesAgo);
      if (recentMoves.length === 0) {
        this.metrics.cursorMoves.delete(key);
      } else {
        this.metrics.cursorMoves.set(key, recentMoves);
      }
    }
  }
  
  report() {
    console.log('Performance Metrics Report:');
    console.log(`Active rooms: ${new Set([...this.metrics.codeChanges.keys()].map(k => k.split(':')[0])).size}`);
    console.log(`Tracked users: ${this.metrics.codeChanges.size}`);
    console.log(`Total code changes: ${[...this.metrics.codeChanges.values()].reduce((a, b) => a + b.length, 0)}`);
    console.log(`Total cursor moves: ${[...this.metrics.cursorMoves.values()].reduce((a, b) => a + b.length, 0)}`);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Report metrics every minute in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.report();
  }, 60000);
}