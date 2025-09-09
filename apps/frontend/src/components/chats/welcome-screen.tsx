"use client";

import { Card } from "../../../../../packages/ui/src/components/card";


export function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  const examples = [
    "Show salinity profiles near the equator",
    "Temperature in Arabian Sea (Mar 2023)",
    "Compare BGC parameters for two regions",
    "Nearest floats to 18.9, 72.8 (Mumbai)",
  ];
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">FloatChat</h1>
          <p className="text-muted-foreground">
            Ask anything about Argo ocean observations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examples.map((ex) => (
            <Card
              key={ex}
              role="button"
              tabIndex={0}
              className="p-4 text-left cursor-pointer hover:shadow-sm border-2 hover:border-primary/30"
              onClick={() => onPick(ex)}
              onKeyDown={(e) => e.key === "Enter" && onPick(ex)}
            >
              <p className="text-sm">{ex}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
