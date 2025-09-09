"use client";

import { useState } from "react";
import { Card } from "../../../../../packages/ui/src/components/card";
import {
  Avatar,
  AvatarFallback,
} from "../../../../../packages/ui/src/components/avatar";
import { Button } from "../../../../../packages/ui/src/components/button";
import { 
  ExternalLink, 
  Bot, 
  User, 
  Copy, 
  Check,
  Search
} from "lucide-react";
import type { Message } from "./chat-interface";

export function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Perplexity-style: render user query as a full-width header with action chips
  if (isUser) {
    return (
      <div className="space-y-3">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug whitespace-pre-wrap">
          {message.content}
        </p>
        <div className="flex items-center gap-2">
          <Button aria-label="Answer" size="sm" variant="ghost" className="h-7 px-2 rounded-md">
            Answer
          </Button>
          <Button aria-label="Sources" size="sm" variant="ghost" className="h-7 px-2 rounded-md">
            Sources
          </Button>
          <Button aria-label="Graph" size="sm" variant="ghost" className="h-7 px-2 rounded-md">
            Graph
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          })}
        </p>
      </div>
    );
  }

  // Assistant message: Perplexity-style full-width block with inline sources, no bubble
  return (
    <div
      className="group relative space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="prose prose-sm max-w-none">
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={`absolute -top-2 -right-2 h-8 w-8 p-0 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={copyToClipboard}
        title="Copy message"
        aria-label="Copy assistant message"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>

      {!!message.sources?.length && (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source, i) => (
              <Button
                key={i}
                asChild
                size="sm"
                variant="ghost"
                className="h-7 px-2 rounded-md max-w-xs truncate"
                title={source.title}
                aria-label={`Source ${i + 1}`}
              >
                <a href={source.url} target="_blank" rel="noreferrer">
                  <span className="inline-flex items-center gap-1">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">
                      {source.title}
                    </span>
                  </span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {new Date(message.timestamp).toLocaleString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short'
        })}
      </p>
    </div>
  );
}
