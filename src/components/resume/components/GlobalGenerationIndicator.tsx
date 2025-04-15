
import React from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface GlobalGenerationIndicatorProps {
  isGenerating: boolean;
  progress: number;
  cvName?: string;
}

export function GlobalGenerationIndicator({
  isGenerating,
  progress,
  cvName,
}: GlobalGenerationIndicatorProps) {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Génération en cours...</h3>
              <p className="text-sm text-muted-foreground">
                {cvName 
                  ? `Le CV "${cvName}" est en cours de génération.`
                  : "Votre CV est en cours de génération."}
              </p>
              <p className="text-sm text-muted-foreground">
                Cette opération peut prendre jusqu'à 1 minute 30.
              </p>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress.toFixed(0)}%
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground py-2">
              Veuillez ne pas fermer cette page pendant la génération
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
