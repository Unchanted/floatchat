"use client";

import { useState } from "react";
import { ScrollArea } from "../../../../../packages/ui/src/components/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from ".//welcome-screen";

type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    // Simulate backend; replace with real API later
    setTimeout(() => {
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Here's an initial take on “${text}”. When backend is ready, I'll stream data, plots, and sources here.`,
        timestamp: new Date().toISOString(),
        sources: [
          { title: "Argo Data (placeholder)", url: "#" },
          { title: "INCOIS (placeholder)", url: "#" },
        ],
      };
      setMessages((m) => [...m, assistant]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <WelcomeScreen onPick={sendMessage} />
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="text-sm text-muted-foreground">Searching…</div>
            )}
          </div>
        </ScrollArea>
      )}

      <div className="p-4 border-t">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
