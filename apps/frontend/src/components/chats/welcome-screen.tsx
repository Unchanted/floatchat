"use client";

import { cn } from "@/lib/utils";

export function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="relative flex-1 flex items-center justify-center bg-white dark:bg-black">
      {/* Grid Background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl w-full text-center space-y-10 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              FloatChat
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your AI assistant for ocean data exploration
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ask questions about ocean temperature, salinity, biogeochemistry, and more from the global Argo float network.
          </p>
        </div>
      </div>
    </div>
  );
}
