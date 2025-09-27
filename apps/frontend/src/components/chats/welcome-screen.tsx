"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../../../../../packages/ui/src/components/button";
import {
  Thermometer,
  Droplets,
  Gauge,
  MapPin,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  const router = useRouter();

  const handleBackgroundClick = () => {
    router.push("/welcome");
  };

  const shortcutQueries = [
    {
      title: "Temperature Study",
      description: "I'm studying ocean temperature patterns",
      query:
        "I am a researcher studying ocean temperature patterns. What data should I look for and how should I proceed?",
      icon: <Thermometer className="w-5 h-5" />,
      color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
    },
    {
      title: "Salinity Research",
      description: "I'm researching salinity variations",
      query:
        "I am researching salinity variations in the ocean. What factors should I consider for my study?",
      icon: <Droplets className="w-5 h-5" />,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    },
    {
      title: "Pressure Analysis",
      description: "I'm analyzing ocean pressure data",
      query:
        "I am analyzing ocean pressure data for my research. What should I focus on?",
      icon: <Gauge className="w-5 h-5" />,
      color: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    },
    {
      title: "Multi-Parameter Study",
      description: "I'm studying multiple ocean parameters",
      query:
        "I am studying multiple ocean parameters together. How should I approach this research?",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700",
    },
    {
      title: "Regional Research",
      description: "I'm doing regional ocean research",
      query:
        "I am doing regional ocean research. What data sources and methods should I use?",
      icon: <MapPin className="w-5 h-5" />,
      color:
        "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
    },
    {
      title: "Climate Study",
      description: "I'm studying ocean climate patterns",
      query:
        "I am studying ocean climate patterns. What approach should I take for my research?",
      icon: <TrendingUp className="w-5 h-5" />,
      color:
        "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
    },
  ];

  const handleShortcutClick = (query: string) => {
    onPick(query);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-white dark:bg-black overflow-y-auto">
      {/* Grid Background - Clickable */}
      <div
        className={cn(
          "absolute inset-0 cursor-pointer",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
        onClick={handleBackgroundClick}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl w-full text-center space-y-8 p-6 mx-auto flex-1 flex flex-col justify-center">
        <div className="space-y-4 pointer-events-none">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/logo.svg" alt="FloatChat Logo" width={48} height={48} className="w-12 h-12" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              FloatChat
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your AI assistant for ocean data exploration
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore ocean temperature, salinity, and pressure data from the
            Indian Ocean Argo float network.
          </p>
        </div>

        {/* Shortcut Queries */}
        <div className="space-y-4 pointer-events-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Quick Start Queries
            </h2>
            <p className="text-sm text-muted-foreground">
              Click on any query below to get started instantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
            {shortcutQueries.map((shortcut, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "h-auto p-3 text-left justify-start border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg min-h-[80px]",
                  shortcut.color,
                )}
                onClick={() => handleShortcutClick(shortcut.query)}
              >
                <div className="flex items-start gap-3 w-full h-full">
                  <div className="flex-shrink-0 mt-1">{shortcut.icon}</div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-semibold text-xs mb-1 leading-tight">
                      {shortcut.title}
                    </h3>
                    <p className="text-xs opacity-80 leading-relaxed line-clamp-2">
                      {shortcut.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
