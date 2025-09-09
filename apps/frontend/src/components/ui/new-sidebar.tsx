"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { IconMenu2, IconX, IconPlus, IconHistory, IconMessage, IconSettings, IconHelpCircle, IconUser } from "@tabler/icons-react";

const mockHistory = [
  { id: "1", title: "Ocean temperature variations near the equator during El Niño events", time: "2h ago" },
  { id: "2", title: "Salinity profiles in the Arabian Sea monsoon season", time: "1d ago" },
  { id: "3", title: "Compare BGC parameters between Pacific and Atlantic", time: "3d ago" },
  { id: "4", title: "Chlorophyll concentrations in the Mediterranean", time: "5d ago" },
  { id: "5", title: "Deep water temperature trends in the Southern Ocean", time: "1w ago" },
  { id: "6", title: "Oxygen levels in coastal upwelling regions", time: "2w ago" },
];

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface NewSidebarProps {
  children?: React.ReactNode;
  links?: SidebarLink[];
  footer?: React.ReactNode;
  className?: string;
  variant?: "solid" | "transparent"; // solid: card bg with border/shadow, transparent: embedded look
}

export function NewSidebar({ children, links = [], footer, className, variant = "solid" }: NewSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-50 h-full overflow-hidden hidden md:flex flex-col transition-colors",
          variant === "solid" && "bg-card border-r border-border shadow-lg",
          variant === "transparent" && (isExpanded ? "bg-white" : "bg-transparent"),
          variant === "transparent" && (isExpanded ? "shadow-lg" : "shadow-0"),
          className
        )}
        initial={{ width: 60 }}
        animate={{ width: isExpanded ? 280 : 60 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <motion.span
              className="font-semibold text-foreground whitespace-nowrap"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: isExpanded ? 1 : 0,
                x: isExpanded ? 0 : -10
              }}
              transition={{ duration: 0.2 }}
            >
              FloatChat
            </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Search Button */}
          <div className="p-3">
            <button 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="New Search"
            >
              <IconPlus className="w-4 h-4 shrink-0" />
              <motion.span
                className="text-sm font-medium whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
              >
                New Search
              </motion.span>
            </button>
          </div>

          {/* Recent Searches */}
          <div className="flex-1 overflow-y-auto px-3">
            <div className="mb-3">
              <motion.div
                className="flex items-center gap-2 px-1 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconHistory className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recent Searches
                </span>
              </motion.div>
              
              <div className="space-y-1">
                {mockHistory.slice(0, 6).map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent rounded-md transition-colors group"
                    title={item.title}
                  >
                    <IconMessage className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <motion.div
                      className="min-w-0 flex-1"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ 
                        opacity: isExpanded ? 1 : 0,
                        width: isExpanded ? "auto" : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-foreground line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.time}
                      </p>
                    </motion.div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent rounded-md transition-colors group" title="Settings">
              <IconSettings className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
              <motion.span
                className="text-sm text-foreground"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
              >
                Settings
              </motion.span>
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent rounded-md transition-colors group" title="Help & Support">
              <IconHelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
              <motion.span
                className="text-sm text-foreground"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
              >
                Help & Support
              </motion.span>
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent rounded-md transition-colors group" title="Account">
              <IconUser className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0" />
              <motion.span
                className="text-sm text-foreground"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : 0
                }}
                transition={{ duration: 0.2 }}
              >
                Account
              </motion.span>
            </button>
          </div>
          <motion.div
            className="pt-2 mt-2 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-muted-foreground text-center">
              FloatChat • Ocean AI Assistant
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-foreground">FloatChat</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <IconMenu2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Mobile Sidebar Panel */}
            <motion.div
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-80 bg-card border-r border-border shadow-xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Mobile Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold text-foreground">FloatChat</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <IconX className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Mobile Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {children ? (
                  children
                ) : (
                  <div className="flex-1 py-4">
                    {links.map((link, index) => (
                      <SidebarLinkItem
                        key={index}
                        link={link}
                        isExpanded={true}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Footer */}
              {footer && (
                <div className="p-4 border-t border-border">
                  {footer}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarLinkItemProps {
  link: SidebarLink;
  isExpanded: boolean;
  onClick?: () => void;
}

function SidebarLinkItem({ link, isExpanded, onClick }: SidebarLinkItemProps) {
  const handleClick = () => {
    link.onClick?.();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors group"
    >
      <div className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
        {link.icon}
      </div>
      <motion.span
        className="text-sm text-foreground whitespace-nowrap"
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0,
          x: isExpanded ? 0 : -10
        }}
        transition={{ duration: 0.2 }}
      >
        {link.label}
      </motion.span>
    </button>
  );
}

export type { SidebarLink };
