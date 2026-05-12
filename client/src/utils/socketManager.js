// client/src/utils/socketManager.js
import { io } from 'socket.io-client';
import { config } from '../config';

class SocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.reconnectDelayIncrement = 1.5;
    this.listeners = new Map();
    this.queuedEvents = [];
    this.isConnected = false;
    this.connectionPromise = null;
  }

  connect(options = {}) {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const socketOptions = {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        ...options
      };

      this.socket = io(config.serverUrl, socketOptions);

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.flushQueuedEvents();
        resolve(this.socket);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        
        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, attempt reconnect
          this.attemptReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts === 0) {
          reject(error);
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
        this.reconnectAttempts = attemptNumber;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.flushQueuedEvents();
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        this.reconnectDelay = Math.min(
          this.reconnectDelay * this.reconnectDelayIncrement,
          this.maxReconnectDelay
        );
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect after maximum attempts');
        this.connectionPromise = null;
        reject(new Error('Failed to reconnect to server'));
      });

      // Ping-pong for connection health check
      this.socket.on('ping', () => {
        console.debug('Ping received from server');
      });

      this.socket.on('pong', (latency) => {
        console.debug(`Pong received, latency: ${latency}ms`);
      });
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
      this.listeners.clear();
      this.queuedEvents = [];
    }
  }

  emit(event, data, callback) {
    if (!this.isConnected) {
      // Queue event if not connected
      this.queuedEvents.push({ event, data, callback });
      
      // Attempt to connect if not already trying
      if (!this.connectionPromise) {
        this.connect();
      }
      return;
    }

    if (this.socket) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    }
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  once(event, handler) {
    if (this.socket) {
      this.socket.once(event, handler);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      console.log(`Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.connect();
    }, this.reconnectDelay);

    // Increase delay for next attempt
    this.reconnectDelay = Math.min(
      this.reconnectDelay * this.reconnectDelayIncrement,
      this.maxReconnectDelay
    );
  }

  flushQueuedEvents() {
    console.log(`Flushing ${this.queuedEvents.length} queued events`);
    
    while (this.queuedEvents.length > 0) {
      const { event, data, callback } = this.queuedEvents.shift();
      this.emit(event, data, callback);
    }
  }

  reattachListeners() {
    if (!this.socket) return;

    for (const [event, handlers] of this.listeners.entries()) {
      for (const handler of handlers) {
        this.socket.on(event, handler);
      }
    }
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.reconnectAttempts > 0) return 'reconnecting';
    return 'connecting';
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected,
      state: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      nextReconnectDelay: this.reconnectDelay,
      queuedEvents: this.queuedEvents.length
    };
  }

  // Manual reconnect with exponential backoff reset
  forceReconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    return this.connect();
  }

  // Check connection health
  async checkConnection() {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      this.socket.emit('ping', Date.now(), (response) => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Export connection states
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};