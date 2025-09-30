export interface WebSocketMessage {
  query: string;
}

export interface WebSocketResponse {
  // Original format
  type?: string;
  content?: string;
  query?: string;
  timestamp?: number;
  
  // Backend stage messages
  stage?: string;
  message?: string;
  result?: Record<string, unknown>;
  error?: string;
  traceback?: string;
  thinking?: string[];
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  // Store callbacks set before a connection exists
  private messageCallback?: (data: WebSocketResponse) => void;
  private errorCallback?: (error: Event | Error) => void;
  private closeCallback?: (event: CloseEvent) => void;

  constructor(url: string = "ws://localhost:8000/ws") {
    this.url = url;
  }

//   constructor(url: string = "wss://fastapi-production-1a8d1.up.railway.app/ws") {
//     this.url = url;
// }


  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            this.socket.close();
            reject(new Error(`WebSocket connection timeout to ${this.url}. Please check if the backend server is running.`));
          }
        }, 5000); // 5 second timeout

        this.socket.onopen = () => {
          console.log("Connected to WebSocket");
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          clearTimeout(connectionTimeout);
          // If a user-provided error handler exists, call it
          if (this.errorCallback) {
            this.errorCallback(error);
          }
          // Reject initial connection attempt errors
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            reject(new Error(`WebSocket connection failed to ${this.url}. Please ensure the backend server is running.`));
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          // If a user-provided close handler exists, call it
          if (this.closeCallback) {
            this.closeCallback(event);
          }
          this.handleReconnect();
        };

        // Attach message handler if one was set before connect()
        if (this.messageCallback) {
          this.socket.onmessage = (event) => {
            try {
              const data: WebSocketResponse = JSON.parse(event.data);
              console.log(event.data);
              this.messageCallback!(data);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          };
        }
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
          // If max attempts reached, notify error callback
          if (this.reconnectAttempts >= this.maxReconnectAttempts && this.errorCallback) {
            this.errorCallback(new Error("Max reconnection attempts reached. Backend server may be unavailable."));
          }
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      // Notify error callback about max attempts reached
      if (this.errorCallback) {
        this.errorCallback(new Error("Max reconnection attempts reached. Backend server may be unavailable."));
      }
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
    // Save callback regardless of socket state
    this.messageCallback = callback;
    // If already connected, attach immediately
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

  onError(callback: (error: Event | Error) => void): void {
    this.errorCallback = callback;
    if (this.socket) {
      this.socket.onerror = callback;
    }
  }

  onClose(callback: (event: CloseEvent) => void): void {
    this.closeCallback = callback;
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
