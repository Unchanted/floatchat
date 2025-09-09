"use client";

import { useState } from "react";
import { Button } from "../../../../../packages/ui/src/components/button";

import { Textarea } from "../../../../../packages/ui/src/components/textarea";
import { Send } from "lucide-react";

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
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Ask about ocean data…"
        className="min-h-[60px] pr-12 resize-none text-base"
        disabled={disabled}
      />
      <Button
        type="button"
        size="sm"
        className="absolute bottom-2 right-2"
        onClick={submit}
        disabled={!value.trim() || disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
