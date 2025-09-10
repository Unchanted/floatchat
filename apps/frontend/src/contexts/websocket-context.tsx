"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { WebSocketService, WebSocketResponse } from '../lib/websocket';

interface WebSocketContextType {
  wsService: WebSocketService | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  isConnected: boolean;
  sendMessage: (message: { query: string }) => void;
  onMessage: (callback: (data: WebSocketResponse) => void) => void;
  onError: (callback: (error: Event) => void) => void;
  onClose: (callback: (event: CloseEvent) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        console.log("🔄 Initializing global WebSocket connection...");
        wsServiceRef.current = new WebSocketService();
        
        // Set up event handlers
        wsServiceRef.current.onError((error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus('disconnected');
        });

        wsServiceRef.current.onClose((event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          setConnectionStatus('disconnected');
        });

        // Connect to WebSocket
        await wsServiceRef.current.connect();
        console.log("✅ Global WebSocket connected successfully");
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        setConnectionStatus('disconnected');
      }
    };

    initWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (message: { query: string }) => {
    if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
      wsServiceRef.current.sendMessage(message);
    } else {
      throw new Error("WebSocket is not connected");
    }
  };

  const onMessage = (callback: (data: WebSocketResponse) => void) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.onMessage(callback);
    }
  };

  const onError = (callback: (error: Event) => void) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.onError(callback);
    }
  };

  const onClose = (callback: (event: CloseEvent) => void) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.onClose(callback);
    }
  };

  const contextValue: WebSocketContextType = {
    wsService: wsServiceRef.current,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    sendMessage,
    onMessage,
    onError,
    onClose,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
