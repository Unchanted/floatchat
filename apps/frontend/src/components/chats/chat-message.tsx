import { Card } from "../../../../../packages/ui/src/components/card";
import {
  Avatar,
  AvatarFallback,
} from "../../../../../packages/ui/src/components/avatar";
import { Button } from "../../../../../packages/ui/src/components/button";
import { ExternalLink, Bot, User } from "lucide-react";
import type { Message } from "./chat-interface";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[80%] space-y-2">
        <Card
          className={`p-4 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-card"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </Card>

        {!!message.sources?.length && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Sources</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((s, i) => (
                <Button
                  key={i}
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs"
                >
                  <a href={s.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {s.title}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
