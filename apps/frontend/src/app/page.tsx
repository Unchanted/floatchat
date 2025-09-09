"use client";

import { AppSidebar } from "../components/app-sidebar";
import { ChatInterface } from "../components/chats/chat-interface";

export default function HomePage() {
  return (
    <div className="relative h-screen bg-muted/30">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Chat Container - Perplexity-style with spacing and rounded corners */}
      <div className="md:ml-[60px] h-full pt-16 md:pt-0">
        <div className="h-full p-4 md:p-6">
          <div className="h-full bg-background rounded-xl shadow-sm border border-border overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
