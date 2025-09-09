"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../../../../../packages/ui/src/components/scroll-area";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Separator } from "../../../../../packages/ui/src/components/separator";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from "./welcome-screen";
import { Search, Sparkles, MoreHorizontal } from "lucide-react";
import { WebSocketService } from "../../lib/websocket";

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
  stage?: "analyzing" | "searching" | "generating" | "processing";
}

// Updated WebSocket response interface to handle all backend message types
export interface WebSocketResponse {
  // Original format
  type?: string;
  content?: string;
  query?: string;
  timestamp?: number;
  
  // Backend stage messages
  stage?: string;
  message?: string;
  result?: any;
  error?: string;
  traceback?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const lastSentUserMessageIdRef = useRef<string | null>(null);

  // Helper function to format result data for display
  const formatResultForDisplay = (result: any): string => {
    if (!result) return "No data available.";
    
    try {
      if (result.summary) {
        // Handle single box/region query
        const dataCount = Array.isArray(result.summary) ? result.summary.length : 'multiple';
        return `🌊 **Ocean Data Analysis Complete**\n\nI found oceanographic data with ${dataCount} Argo float measurements in your requested region. The data includes temperature, salinity, and pressure profiles from autonomous floats drifting in the ocean.\n\n**Key Findings:**\n- Data points collected from Argo global ocean observing system\n- Measurements span the requested geographical area and time period\n- Includes vertical profiles of ocean properties\n\nThis data provides valuable insights into ocean conditions and can be used for climate research, weather forecasting, and marine ecosystem studies.`;
      } else if (result.summaries) {
        // Handle multiple point queries
        const totalPoints = result.summaries.length;
        const successfulPoints = result.summaries.filter((s: any) => !s.error).length;
        const errorPoints = totalPoints - successfulPoints;
        
        let content = `🌊 **Multi-Point Ocean Data Analysis**\n\nAnalyzed ${totalPoints} locations in the ocean:\n\n`;
        
        if (successfulPoints > 0) {
          content += `✅ **Successfully retrieved data from ${successfulPoints} locations**\n`;
        }
        
        if (errorPoints > 0) {
          content += `⚠️ **${errorPoints} locations had no available data**\n`;
        }
        
        content += `\n**Data Summary:**\n`;
        result.summaries.forEach((summary: any, index: number) => {
          const point = summary.point;
          if (summary.error) {
            content += `- Point ${index + 1} (${point.lat}°N, ${point.lon}°E): No data available\n`;
          } else {
            content += `- Point ${index + 1} (${point.lat}°N, ${point.lon}°E): Data retrieved\n`;
          }
        });
        
        return content;
      } else if (typeof result === 'object') {
        // Fallback for other object types
        return `📊 **Data Retrieved Successfully**\n\nReceived oceanographic data from your query. The response contains:\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
      } else {
        return result.toString();
      }
    } catch (error) {
      console.error("Error formatting result:", error);
      return "Data received successfully, but couldn't format for display. Check console for raw data.";
    }
  };

  useEffect(() => {
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        console.log("🔄 Initializing WebSocket connection...");
        wsServiceRef.current = new WebSocketService();
        
        // Set up enhanced event handlers
        wsServiceRef.current.onMessage((data: WebSocketResponse) => {
          console.group("💬 Processing WebSocket Response");
          console.log("Full response object:", data);
          console.log("Stage:", data.stage);
          console.log("Message:", data.message);
          console.log("Result:", data.result);
          console.log("Type:", data.type);
          console.log("Content:", data.content);
          console.groupEnd();
          
          // Handle different message types from backend
          if (data.stage) {
            switch (data.stage) {
              case "analyzing":
                console.log("🔎 Stage: Analyzing query");
                setLoadingState({ isLoading: true, stage: "analyzing" });
                break;
                
              case "sql_generation":
                console.log("🛠 Stage: Generating SQL");
                setLoadingState({ isLoading: true, stage: "searching" });
                break;
                
              case "db_fetch":
                console.log("📡 Stage: Fetching from database");
                setLoadingState({ isLoading: true, stage: "analyzing" });
                break;
                
              case "processing":
                console.log("⚙️ Stage: Processing data");
                setLoadingState({ isLoading: true, stage: "generating" });
                break;
                
              case "completed":
                console.log("✅ Stage: Processing completed");
                // Keep loading state until we get the actual result
                setLoadingState({ isLoading: true, stage: "generating" });
                break;
                
              case "result":
                console.log("📋 Stage: Final result received");
                const assistant: Message = {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: formatResultForDisplay(data.result),
                  timestamp: new Date().toISOString(),
                  sources: [
                    { title: "Argo Global Data Assembly Centre", url: "https://argo.ucsd.edu" },
                    { title: "Ocean Climate Portal - INCOIS", url: "https://incois.gov.in" },
                    { title: "World Ocean Database", url: "https://www.ncei.noaa.gov/wod" },
                  ],
                };
                setMessages((m) => [...m, assistant]);
                setLoadingState({ isLoading: false });
                break;
                
              case "error":
                console.error("❌ Stage: Error occurred");
                const errorMessage: Message = {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `❌ **Error Processing Request**\n\n${data.message}\n\n${data.traceback ? `**Technical Details:**\n\`\`\`\n${data.traceback}\n\`\`\`` : ''}`,
                  timestamp: new Date().toISOString(),
                };
                setMessages((m) => [...m, errorMessage]);
                setLoadingState({ isLoading: false });
                break;
                
              case "no_function_call":
                console.log("💭 Stage: No function call from Gemini");
                const textMessage: Message = {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: data.message || "I couldn't process your request as a structured query. Please try rephrasing your question about ocean data.",
                  timestamp: new Date().toISOString(),
                };
                setMessages((m) => [...m, textMessage]);
                setLoadingState({ isLoading: false });
                break;
                
              default:
                console.warn("⚠️ Unknown message stage:", data.stage);
                // Handle as generic message
                if (data.message) {
                  const genericMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.message,
                    timestamp: new Date().toISOString(),
                  };
                  setMessages((m) => [...m, genericMessage]);
                  setLoadingState({ isLoading: false });
                }
            }
          } else if (data.type && data.content) {
            // Handle original format messages
            console.log("📨 Handling original format message");
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
          } else if (data.error) {
            // Handle direct error messages
            console.error("❌ Direct error message received");
            const errorMsg: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ **Error**: ${data.error}`,
              timestamp: new Date().toISOString(),
            };
            setMessages((m) => [...m, errorMsg]);
            setLoadingState({ isLoading: false });
          }
        });

        wsServiceRef.current.onError((error) => {
          console.group("❌ WebSocket Error");
          console.error("Error details:", error);
          console.log("Connection status before error:", connectionStatus);
          console.groupEnd();
          
          setConnectionStatus('disconnected');
          setLoadingState({ isLoading: false });
        });

        wsServiceRef.current.onClose((event) => {
          console.group("🔌 WebSocket Connection Closed");
          console.log("Close code:", event.code);
          console.log("Close reason:", event.reason);
          console.log("Was clean:", event.wasClean);
          console.groupEnd();
          
          setConnectionStatus('disconnected');
          setLoadingState({ isLoading: false });
        });

        // Connect to WebSocket
        await wsServiceRef.current.connect();
        console.log("✅ WebSocket connected successfully");
        setConnectionStatus('connected');
      } catch (error) {
        console.group("❌ WebSocket Initialization Failed");
        console.error("Error:", error);
        console.groupEnd();
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
    setLoadingState({ isLoading: true, stage: "analyzing" });

    try {
      if (wsServiceRef.current && wsServiceRef.current.isConnected()) {
        console.group("📤 Sending WebSocket Message");
        console.log("Query:", text);
        console.log("Message object:", { query: text });
        console.groupEnd();
        
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
        content: `❌ **Connection Error**\n\nI'm having trouble connecting to the ocean data analysis system. Please check your connection and try again.\n\n**Error Details:** ${error}`,
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
      analyzing: "Analyzing your ocean data query...",
      searching: "Generating database query...",
      generating: "Processing oceanographic data...",
      processing: "Finalizing results..."
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
