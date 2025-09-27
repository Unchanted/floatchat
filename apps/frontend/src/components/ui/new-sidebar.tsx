"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { IconMenu2, IconX, IconPlus, IconHistory, IconMessage, IconSettings, IconHelpCircle, IconUser, IconTrash } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useChat } from "../../contexts/chat-context";

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

export function NewSidebar({ children, footer, className, variant = "solid" }: NewSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { chats, activeChatId, createNewChat, switchToChat, deleteChat } = useChat();
  
  // Show logo on welcome page and during chat interactions
  const shouldShowLogo = pathname === '/welcome';

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatClick = (chatId: string) => {
    switchToChat(chatId);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-50 h-full hidden md:flex flex-col transition-colors",
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
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            {shouldShowLogo ? (
              <Image src="/logo.svg" alt="FloatChat Logo" width={32} height={32} className="w-8 h-8 shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
            )}
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
        <div className="flex-1 flex flex-col">
          {/* New Search Button */}
          <div className="p-3">
            <button 
              onClick={handleNewChat}
              className={cn(
                "flex items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md",
                isExpanded ? "w-full justify-center px-4 py-2.5 gap-2" : "w-10 h-10 justify-center p-0 mx-auto gap-0"
              )}
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
          {chats.length > 0 && (
            <div className="flex-1 px-3 overflow-hidden">
              <div className="mb-3">
                <motion.div
                  className="flex items-center gap-2 px-1 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconHistory className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recent Searches
                  </span>
                </motion.div>
                <div className="space-y-0.5">
                  {chats.slice(0, 6).map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 rounded-md transition-all duration-200 group relative",
                        activeChatId === chat.id && "bg-accent"
                      )}
                    >
                      <button
                        onClick={() => handleChatClick(chat.id)}
                        className="flex items-center gap-3 flex-1 text-left min-w-0"
                        title={chat.title}
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
                            {chat.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(chat.updatedAt)}
                          </p>
                        </motion.div>
                      </button>
                      {isExpanded && (
                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded shrink-0"
                          title="Delete chat"
                        >
                          <IconTrash className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 mt-auto">
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 rounded-md transition-all duration-200 group" title="Settings">
              <IconSettings className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 rounded-md transition-all duration-200 group" title="Help & Support">
              <IconHelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
            <button className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-accent/50 rounded-md transition-all duration-200 group" title="Account">
              <IconUser className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
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
        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {shouldShowLogo ? (
            <Image src="/logo.svg" alt="FloatChat Logo" width={32} height={32} className="w-8 h-8" />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
          )}
          <span className="font-semibold text-foreground">FloatChat</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-200"
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
                  {shouldShowLogo ? (
                    <Image src="/logo.svg" alt="FloatChat Logo" width={32} height={32} className="w-8 h-8" />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">F</span>
                    </div>
                  )}
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
                    {/* New Chat Button */}
                    <div className="px-4 mb-6">
                      <button 
                        onClick={() => {
                          handleNewChat();
                          setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <IconPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">New Search</span>
                      </button>
                    </div>

                    {/* Recent Chats */}
                    {chats.length > 0 && (
                      <div className="px-4">
                        <div className="flex items-center gap-2 mb-4">
                          <IconHistory className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Recent Searches
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {chats.slice(0, 8).map((chat) => (
                            <div
                              key={chat.id}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/50 rounded-md transition-all duration-200 group relative",
                                activeChatId === chat.id && "bg-accent"
                              )}
                            >
                              <button
                                onClick={() => {
                                  handleChatClick(chat.id);
                                  setIsMobileOpen(false);
                                }}
                                className="flex items-center gap-3 flex-1 text-left min-w-0"
                              >
                                <IconMessage className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-foreground line-clamp-2 leading-tight">
                                    {chat.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatTime(chat.updatedAt)}
                                  </p>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  handleDeleteChat(e, chat.id);
                                  setIsMobileOpen(false);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded shrink-0"
                                title="Delete chat"
                              >
                                <IconTrash className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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


export type { SidebarLink };
