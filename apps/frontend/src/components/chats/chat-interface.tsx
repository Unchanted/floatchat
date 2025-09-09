"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../../../../../packages/ui/src/components/scroll-area";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Separator } from "../../../../../packages/ui/src/components/separator";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from "./welcome-screen";
import { Search, Sparkles, MoreHorizontal } from "lucide-react";
import { WebSocketService, WebSocketResponse } from "../../lib/websocket";

type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
}

interface LoadingState {
  isLoading: boolean;
  stage?: "searching" | "analyzing" | "generating";
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const lastSentUserMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        wsServiceRef.current = new WebSocketService();
        
        // Set up event handlers
        wsServiceRef.current.onMessage((data: WebSocketResponse) => {
          console.log("=== WEBSOCKET RESPONSE ===");
          console.log("Full response object:", data);
          console.log("Response type:", data.type);
          console.log("Response content:", data.content);
          console.log("Original query:", data.query);
          console.log("Timestamp:", data.timestamp);
          console.log("=========================");
          
          const assistant: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.content,
            timestamp: new Date().toISOString(),
            sources: [
              { title: "Argo Global Data Assembly Centre", url: "https://argo.ucsd.edu" },
              { title: "Ocean Climate Portal - INCOIS", url: "https://incois.gov.in" },
              { title: "World Ocean Database", url: "https://www.ncei.noaa.gov/wod" },
            ],
          };
          setMessages((m) => [...m, assistant]);
          setLoadingState({ isLoading: false });
        });

        wsServiceRef.current.onError((error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus('disconnected');
          setLoadingState({ isLoading: false });
        });

        wsServiceRef.current.onClose((event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          setConnectionStatus('disconnected');
          setLoadingState({ isLoading: false });
        });

        // Connect to WebSocket
        await wsServiceRef.current.connect();
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

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    lastSentUserMessageIdRef.current = userMsg.id;
    setLoadingState({ isLoading: true, stage: "searching" });

    // Simulate multi-stage loading
    setTimeout(() => {
      setLoadingState({ isLoading: true, stage: "analyzing" });
    }, 800);

    setTimeout(() => {
      setLoadingState({ isLoading: true, stage: "generating" });
    }, 1600);

    try {
      if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
        console.log("=== SENDING WEBSOCKET MESSAGE ===");
        console.log("Query:", text);
        console.log("Message object:", { query: text });
        console.log("=================================");
        wsServiceRef.current.sendMessage({ query: text });
      } else {
        throw new Error("WebSocket is not connected");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setLoadingState({ isLoading: false });
      
      // Fallback response if WebSocket fails
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm sorry, I'm having trouble connecting to the ocean data analysis system. Please check your connection and try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistant]);
    }
  };

  // After messages update, if the last added message was from the user, snap it to the top
  useEffect(() => {
    if (!lastSentUserMessageIdRef.current) return;
    const messageId = lastSentUserMessageIdRef.current;

    const viewport = document.querySelector(
      "#chat-scroll-area [data-slot=\"scroll-area-viewport\"]"
    ) as HTMLElement | null;
    const target = document.getElementById(`msg-${messageId}`);

    if (viewport && target) {
      const viewportRect = viewport.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const top = targetRect.top - viewportRect.top + viewport.scrollTop;
      viewport.scrollTo({ top, behavior: "auto" });
    }

    // reset once handled
    lastSentUserMessageIdRef.current = null;
  }, [messages.length]);

  const LoadingIndicator = ({ stage }: { stage?: string }) => {
    const stageText = {
      searching: "Searching ocean databases...",
      analyzing: "Analyzing oceanographic data...",
      generating: "Generating insights..."
    };

    return (
      <div className="flex items-center gap-3 p-6">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
        <span className="text-sm text-muted-foreground">
          {stage ? stageText[stage as keyof typeof stageText] : "Processing..."}
        </span>
      </div>
    );
  };

  const ConnectionStatus = () => {
    const statusConfig = {
      connecting: { color: "bg-yellow-500", text: "Connecting to ocean data system..." },
      connected: { color: "bg-green-500", text: "Connected to ocean data system" },
      disconnected: { color: "bg-red-500", text: "Disconnected from ocean data system" }
    };

    const config = statusConfig[connectionStatus];

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <div className={`w-2 h-2 rounded-full ${config.color} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></div>
        <span className="text-xs text-muted-foreground">{config.text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen onPick={sendMessage} />
        ) : (
          <ScrollArea id="chat-scroll-area" className="flex-1 min-h-0">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg, index) => (
                <div key={msg.id} id={`msg-${msg.id}`}>
                  <ChatMessage message={msg} />
                  {index < messages.length - 1 && (
                    <Separator className="my-8 opacity-50" />
                  )}
                </div>
              ))}
              {loadingState.isLoading && (
                <LoadingIndicator stage={loadingState.stage} />
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="bg-transparent shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <ChatInput 
              onSend={sendMessage} 
              disabled={loadingState.isLoading || connectionStatus !== 'connected'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
