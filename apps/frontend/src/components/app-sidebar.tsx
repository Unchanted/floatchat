"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "../../../../packages/ui/src/components/sidebar";
import { Button } from "../../../../packages/ui/src/components/button";
import { ScrollArea } from "../../../../packages/ui/src/components/scroll-area";
import { Separator } from "../../../../packages/ui/src/components/separator";
import { History, MessageSquare, Plus } from "lucide-react";

const mockHistory = [
  { id: "1", title: "Ocean temperature near equator", time: "2h ago" },
  { id: "2", title: "Salinity profiles Arabian Sea", time: "1d ago" },
  { id: "3", title: "Compare BGC parameters", time: "3d ago" },
];

export function AppSidebar() {
  return (
    <Sidebar className="w-72">
      <SidebarHeader className="p-4">
        <Button className="w-full justify-start gap-2" size="lg">
          <Plus className="h-4 w-4" />
          New Search
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Searches
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-220px)] px-2">
              <div className="space-y-1">
                {mockHistory.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-sm line-clamp-2">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-3" />
        <p className="text-xs text-muted-foreground">FloatChat • UI Preview</p>
      </SidebarFooter>
    </Sidebar>
  );
}
