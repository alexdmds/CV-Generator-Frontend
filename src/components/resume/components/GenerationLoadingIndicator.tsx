
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface GenerationLoadingIndicatorProps {
  progress?: number;
  message?: string;
}

export function GenerationLoadingIndicator({ 
  progress = 0, 
  message = "Génération en cours..."
}: GenerationLoadingIndicatorProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border shadow-lg rounded-lg p-8 max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">{message}</h2>
          <p className="text-muted-foreground text-sm">
            Cette opération peut prendre jusqu'à 1 minute 30. Veuillez patienter.
          </p>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-xs text-center text-muted-foreground">
          Progression: {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
