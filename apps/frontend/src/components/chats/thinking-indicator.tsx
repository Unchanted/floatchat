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
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {/* Main container with improved corners and spacing */}
        <div className="bg-background border border-border rounded-xl p-6 space-y-4 shadow-sm">
          {/* Header with stage indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`p-2 rounded-lg bg-muted/50 ${getStageColor(stage)}`}>
                  {getStageIcon(stage)}
                </div>
                {isAnimating && (
                  <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping" />
                )}
                {showCompletion && (
                  <div className="absolute -inset-1 rounded-lg bg-green-500/20 animate-ping" />
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
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`group flex items-start gap-3 p-4 rounded-lg border transition-all duration-500 ease-out ${
                  step.completed
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : step.active
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <div className="relative">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                    </div>
                  ) : step.active ? (
                    <div className="relative">
                      <div 
                        className="h-4 w-4 rounded-full bg-primary animate-pulse"
                        style={{ transform: `scale(${pulseIntensity})` }}
                      />
                      <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed transition-all duration-500 ease-out ${
                      step.active 
                        ? "font-medium text-foreground" 
                        : step.completed
                        ? "text-green-700 dark:text-green-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.text}
                  </p>
                  
                  {step.active && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs text-primary font-mono">processing...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-mono">
                {currentStepIndex + 1}/{steps.length} steps
              </span>
            </div>
            
            <div className="relative">
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${((currentStepIndex + (steps.find(s => s.active) ? 0.3 : 1)) / steps.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Completion state */}
          {showCompletion && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in-50 duration-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>All analysis steps completed. Preparing results...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
