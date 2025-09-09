"use client";

 

export function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-10">
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
