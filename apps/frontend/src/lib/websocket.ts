export interface WebSocketMessage {
  query: string;
}

export interface WebSocketResponse {
  type: string;
  content: string;
  query: string;
  timestamp: number;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second

  constructor(url: string = "ws://localhost:8000/ws") {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log("Connected to WebSocket");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          this.handleReconnect();
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      throw new Error("WebSocket is not connected");
    }
  }

  onMessage(callback: (data: WebSocketResponse) => void): void {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data);
          console.log(event.data);
          callback(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }
  }

  onError(callback: (error: Event) => void): void {
    if (this.socket) {
      this.socket.onerror = callback;
    }
  }

  onClose(callback: (event: CloseEvent) => void): void {
    if (this.socket) {
      this.socket.onclose = callback;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
