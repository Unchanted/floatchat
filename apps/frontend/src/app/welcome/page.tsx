"use client";

import { AppSidebar } from "../../components/app-sidebar";
import { ChatInterface } from "../../components/chats/chat-interface";
import Link from "next/link";
import { Button } from "../../../../../packages/ui/src/components/button";
import { MapPin } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="relative h-screen bg-muted/30">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Chat Container - Perplexity-style with spacing and rounded corners */}
      <div className="md:ml-[60px] h-full pt-16 md:pt-0">
        <div className="h-full p-4 md:p-6">
          <div className="h-full bg-background rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Navigation to onboard page */}
            <div className="absolute top-4 right-4 z-10">
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 shadow-lg transition-all duration-200"
                >
                  <MapPin className="h-4 w-4" />
                  World Map
                </Button>
              </Link>
            </div>
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
