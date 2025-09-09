"use client";

import { useState } from "react";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Textarea } from "../../../../../packages/ui/src/components/textarea";
import { Send, Loader2 } from "lucide-react";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="flex gap-3 p-4 border border-border rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={disabled ? "Searching..." : "Ask about ocean data…"}
        className="min-h-[44px] resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground text-base"
        disabled={disabled}
        rows={1}
      />
      <Button
        type="button"
        size="sm"
        onClick={submit}
        disabled={!value.trim() || disabled}
        className="shrink-0 h-11 w-11 rounded-xl"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
