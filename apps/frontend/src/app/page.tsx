"use client";

import { SidebarProvider, SidebarTrigger } from "../../../../packages/ui/src/components/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { ChatInterface } from "../components/chats/chat-interface";

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Mobile trigger (optional, you can move into a topbar) */}
          <div className="p-2 md:hidden">
            <SidebarTrigger />
          </div>
          <ChatInterface />
        </main>
      </div>
    </SidebarProvider>
  );
}
