"use client";

import { Card } from "../../../../../packages/ui/src/components/card";
import { Button } from "../../../../../packages/ui/src/components/button";
import { Search, Waves, Thermometer, BarChart3, MapPin, Globe } from "lucide-react";

export function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  const examples = [
    {
      icon: Thermometer,
      title: "Temperature Analysis",
      query: "Show temperature profiles near the equator"
    },
    {
      icon: Waves,
      title: "Salinity Patterns", 
      query: "Temperature in Arabian Sea (Mar 2023)"
    },
    {
      icon: BarChart3,
      title: "BGC Parameters",
      query: "Compare BGC parameters for two regions"
    },
    {
      icon: MapPin,
      title: "Location Search",
      query: "Nearest floats to 18.9, 72.8 (Mumbai)"
    },
    {
      icon: Globe,
      title: "Global Patterns",
      query: "Show El Niño impact on Pacific Ocean temperatures"
    },
    {
      icon: Search,
      title: "Data Discovery",
      query: "What data is available for the Mediterranean Sea?"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-10">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Search className="h-6 w-6 text-primary-foreground" />
            </div>
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

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Try asking about...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examples.map((example) => {
              const IconComponent = example.icon;
              return (
                <Card
                  key={example.query}
                  role="button"
                  tabIndex={0}
                  className="p-5 cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 group border-border/50"
                  onClick={() => onPick(example.query)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPick(example.query);
                    }
                  }}
                >
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">{example.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {example.query}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPick("What is the current temperature at 500m depth in the North Atlantic?")}
          >
            Quick: North Atlantic
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPick("Show me recent data from Indian Ocean floats")}
          >
            Quick: Indian Ocean
          </Button>
        </div>
      </div>
    </div>
  );
}
