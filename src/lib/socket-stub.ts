// Simple socket.io-client stub
export interface Socket {
  id: string;
  connected: boolean;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback?: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  connect(): void;
  disconnect(): void;
}

export interface ManagerOptions {
  transports?: string[];
  autoConnect?: boolean;
}

class SocketStub implements Socket {
  id = 'stub-' + Math.random().toString(36).substr(2, 9);
  connected = false;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    // In a real implementation, this would send to the server
    console.log('Socket emit:', event, args);
  }

  connect(): void {
    this.connected = true;
    this.trigger('connect');
  }

  disconnect(): void {
    this.connected = false;
    this.trigger('disconnect');
  }

  private trigger(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(...args));
    }
  }

  // Simulate receiving an event
  simulate(event: string, ...args: any[]): void {
    this.trigger(event, ...args);
  }
}

export function io(_url?: string, options?: ManagerOptions): Socket {
  const socket = new SocketStub();
  if (options?.autoConnect !== false) {
    setTimeout(() => socket.connect(), 0);
  }
  return socket;
}

export default io;
