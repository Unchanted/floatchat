"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../../../../../packages/ui/src/components/scroll-area";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Separator } from "../../../../../packages/ui/src/components/separator";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from "./welcome-screen";
import { Search, Sparkles, MoreHorizontal } from "lucide-react";

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
  const lastSentUserMessageIdRef = useRef<string | null>(null);

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

    // Simulate backend; replace with real API later
    setTimeout(() => {
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Based on the latest Argo float data, here's what I found regarding "${text}":

The analysis reveals significant patterns in oceanographic measurements. The data shows temporal variations that correlate with seasonal cycles and regional characteristics.

Key findings include:
• Temperature profiles indicate thermocline depth variations
• Salinity measurements show halocline structures
• Biogeochemical parameters reveal productivity patterns
• Spatial distribution highlights regional differences

This analysis is based on quality-controlled Argo observations from the global array. The results provide insights into ocean dynamics and climate variability in the specified region.`,
        timestamp: new Date().toISOString(),
        sources: [
          { title: "Argo Global Data Assembly Centre", url: "https://argo.ucsd.edu" },
          { title: "Ocean Climate Portal - INCOIS", url: "https://incois.gov.in" },
          { title: "World Ocean Database", url: "https://www.ncei.noaa.gov/wod" },
        ],
      };
      setMessages((m) => [...m, assistant]);
      setLoadingState({ isLoading: false });
    }, 2400);
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

  return (
    <div className="flex flex-col h-full">
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
            <ChatInput onSend={sendMessage} disabled={loadingState.isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
