"use client";

import React from "react";
import { NewSidebar } from "./ui/new-sidebar";
import type { SidebarLink } from "./ui/new-sidebar";
import {
  IconPlus,
  IconHistory,
  IconMessage,
  IconSettings,
  IconHelpCircle,
  IconUser,
  IconSearch,
} from "@tabler/icons-react";

const mockHistory = [
  { id: "1", title: "Ocean temperature variations near the equator during El Niño events", time: "2h ago" },
  { id: "2", title: "Salinity profiles in the Arabian Sea monsoon season", time: "1d ago" },
  { id: "3", title: "Compare BGC parameters between Pacific and Atlantic", time: "3d ago" },
  { id: "4", title: "Chlorophyll concentrations in the Mediterranean", time: "5d ago" },
  { id: "5", title: "Deep water temperature trends in the Southern Ocean", time: "1w ago" },
  { id: "6", title: "Oxygen levels in coastal upwelling regions", time: "2w ago" },
  { id: "7", title: "pH variations in coral reef environments", time: "3w ago" },
  { id: "8", title: "Nutrient distribution patterns in the Arctic Ocean", time: "1m ago" },
];

export function AppSidebar() {
  const sidebarLinks: SidebarLink[] = [
    {
      label: "New Search",
      href: "#",
      icon: <IconPlus className="w-5 h-5" />,
      onClick: () => {
        // Handle new search
        console.log("New search clicked");
      },
    },
    ...mockHistory.slice(0, 8).map((item) => ({
      label: item.title,
      href: "#",
      icon: <IconMessage className="w-4 h-4" />,
      onClick: () => {
        console.log("History item clicked:", item.id);
      },
    })),
  ];

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

  return <NewSidebar variant="transparent" />;
}
