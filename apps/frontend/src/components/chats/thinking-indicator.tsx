"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, CheckCircle2, Circle, Loader2, Sparkles, Zap } from "lucide-react";

interface ThinkingStep {
  text: string;
  completed: boolean;
  active: boolean;
  id: string;
}

interface ThinkingIndicatorProps {
  thinking: string[];
  stage: string;
  isVisible: boolean;
}

export function ThinkingIndicator({ thinking, stage, isVisible }: ThinkingIndicatorProps) {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!thinking || thinking.length === 0) return;

    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pulseRef.current) clearInterval(pulseRef.current);

    // Initialize steps with unique IDs
    const initialSteps: ThinkingStep[] = thinking.map((text, index) => ({
      text,
      completed: false,
      active: index === 0,
      id: `step-${index}-${Date.now()}`,
    }));
    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setIsAnimating(true);
    setShowCompletion(false);

    // Start pulse animation
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => prev === 1 ? 1.2 : 1);
    }, 2000);
    pulseRef.current = pulseInterval;

    // Animate through steps with slower timing
    const stepInterval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        const currentIndex = newSteps.findIndex((step) => step.active);
        
        if (currentIndex >= 0 && currentIndex < newSteps.length) {
          // Mark current step as completed with delay
          setTimeout(() => {
            setSteps(prev => prev.map((step, idx) => 
              idx === currentIndex ? { ...step, completed: true, active: false } : step
            ));
          }, 500);

          // Activate next step
          const nextIndex = currentIndex + 1;
          if (nextIndex < newSteps.length) {
            setTimeout(() => {
              setSteps(prev => prev.map((step, idx) => 
                idx === nextIndex ? { ...step, active: true } : step
              ));
              setCurrentStepIndex(nextIndex);
            }, 800);
          } else {
            // All steps completed, show completion state
            setTimeout(() => {
              setIsAnimating(false);
              setShowCompletion(true);
            }, 1000);
          }
        }

        return newSteps;
      });
    }, 2500); // Each step shows for 2.5 seconds

    intervalRef.current = stepInterval;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pulseRef.current) clearInterval(pulseRef.current);
    };
  }, [thinking, stage]);

  if (!isVisible || !thinking || thinking.length === 0) {
    return null;
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "analyzing": return <Brain className="h-5 w-5" />;
      case "sql_generation": return <Zap className="h-5 w-5" />;
      case "db_fetch": return <Loader2 className="h-5 w-5" />;
      case "processing": return <Sparkles className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "analyzing": return "text-blue-500";
      case "sql_generation": return "text-purple-500";
      case "db_fetch": return "text-green-500";
      case "processing": return "text-orange-500";
      default: return "text-primary";
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
      
      {/* Main container */}
      <div className="relative bg-gradient-to-br from-background/95 to-muted/20 border border-border/60 rounded-2xl p-6 space-y-5 shadow-lg backdrop-blur-sm">
        {/* Header with stage indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`p-2 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 ${getStageColor(stage)}`}>
                {getStageIcon(stage)}
              </div>
              {isAnimating && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
              {showCompletion && (
                <div className="absolute -inset-1 rounded-full bg-green-500/20 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {showCompletion ? "Analysis Complete" : "Processing Ocean Data"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {showCompletion ? "Generating final results..." : "AI is analyzing your request"}
              </p>
            </div>
          </div>
          
          {isAnimating && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
        
        {/* Thinking steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`group flex items-start gap-4 p-3 rounded-xl transition-all duration-700 ease-out ${
                step.completed
                  ? "bg-green-500/5 border border-green-500/20"
                  : step.active
                  ? "bg-primary/5 border border-primary/20 shadow-sm"
                  : "bg-muted/30 border border-transparent"
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <div className="relative">
                    <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in-50 duration-500" />
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                  </div>
                ) : step.active ? (
                  <div className="relative">
                    <div 
                      className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-primary/60 animate-pulse"
                      style={{ transform: `scale(${pulseIntensity})` }}
                    />
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  </div>
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed transition-all duration-700 ease-out ${
                    step.active 
                      ? "font-medium text-foreground" 
                      : step.completed
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {step.text}
                </p>
                
                {step.active && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs text-primary font-mono">processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced progress indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono">
              {currentStepIndex + 1}/{steps.length} steps
            </span>
          </div>
          
          <div className="relative">
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-1000 ease-out relative"
                style={{ 
                  width: `${((currentStepIndex + (steps.find(s => s.active) ? 0.3 : 1)) / steps.length) * 100}%` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            
            {/* Floating progress dots */}
            {isAnimating && (
              <div className="absolute top-0 left-0 w-full h-full">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/60 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completion state */}
        {showCompletion && (
          <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in-50 duration-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>All analysis steps completed. Preparing results...</span>
          </div>
        )}
      </div>
    </div>
  );
}
