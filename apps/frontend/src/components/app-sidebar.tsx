"use client";

import React from "react";
import { NewSidebar } from "./ui/new-sidebar";
import {
  IconSettings,
  IconHelpCircle,
  IconUser,
} from "@tabler/icons-react";

// Mock history removed - now using real chat data from context

export function AppSidebar() {
  // Sidebar links removed - now handled by NewSidebar component with real chat data

  const footerContent = (
    <div className="space-y-1 mt-auto">
      <div className="space-y-0.5">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-md transition-colors group">
          <IconSettings className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm text-foreground">Settings</span>
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-md transition-colors group">
          <IconHelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm text-foreground">Help & Support</span>
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-md transition-colors group">
          <IconUser className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm text-foreground">Account</span>
        </button>
      </div>
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          FloatChat • Ocean AI Assistant
        </p>
      </div>
    </div>
  );

  return <NewSidebar variant="transparent" footer={footerContent} />;
}
