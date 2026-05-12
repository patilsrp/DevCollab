// client/src/utils/logger.js

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.logs = [];
    this.maxLogs = 1000;
    this.listeners = new Set();
  }

  getLogLevel() {
    if (import.meta.env.DEV) {
      return LOG_LEVELS.DEBUG;
    }
    return LOG_LEVELS.WARN;
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data,
      stack: level === 'ERROR' ? new Error().stack : undefined
    };
  }

  log(level, message, data = {}) {
    const numericLevel = LOG_LEVELS[level];
    if (numericLevel === undefined || numericLevel > this.level) {
      return;
    }

    const logEntry = this.formatMessage(level, message, data);

    // Store in memory (for debugging/export)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (e) {
        // Silent fail for listeners
      }
    });

    // Console output with styling
    this.outputToConsole(logEntry);
  }

  outputToConsole(entry) {
    const { level, message, data, timestamp } = entry;
    const styles = {
      ERROR: 'color: #ff6b6b; font-weight: bold',
      WARN: 'color: #ffa500; font-weight: bold',
      INFO: 'color: #4ECDC4',
      DEBUG: 'color: #888',
      TRACE: 'color: #555; font-style: italic'
    };

    const consoleMethod = {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug',
      TRACE: 'trace'
    }[level] || 'log';

    const time = timestamp.split('T')[1].split('.')[0];
    const prefix = `%c[${time}] [${level}]`;

    if (data && Object.keys(data).length > 0) {
      console[consoleMethod](prefix, styles[level], message, data);
    } else {
      console[consoleMethod](prefix, styles[level], message);
    }
  }

  error(message, data) {
    this.log('ERROR', message, data);
  }

  warn(message, data) {
    this.log('WARN', message, data);
  }

  info(message, data) {
    this.log('INFO', message, data);
  }

  debug(message, data) {
    this.log('DEBUG', message, data);
  }

  trace(message, data) {
    this.log('TRACE', message, data);
  }

  // Specialized logging methods
  socket(event, data) {
    this.debug(`Socket: ${event}`, { context: 'socket', ...data });
  }

  performance(metric, value, data) {
    this.debug(`Performance: ${metric}=${value}`, {
      context: 'performance',
      metric,
      value,
      ...data
    });
  }

  user(action, data) {
    this.info(`User: ${action}`, { context: 'user', ...data });
  }

  // Subscribe to log events (useful for displaying in UI)
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Export logs (useful for debugging)
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Download logs as file
  downloadLogs() {
    const blob = new Blob([this.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devcollab-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Get logs filtered by level
  getLogs(level = null) {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  // Performance timing helpers
  time(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.timeEnd(label);
    }
  }

  // Group logging
  group(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.groupEnd();
    }
  }
}

// Export singleton
export const logger = new Logger();

// Export for compatibility with existing console.log calls
export default logger;