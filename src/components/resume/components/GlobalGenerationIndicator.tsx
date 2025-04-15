
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

// Messages contextuels pour les différentes étapes de génération
const generationMessages = [
  "Analyse de la fiche de poste...",
  "Extraction des compétences clés...",
  "Adaptation de votre profil au poste...",
  "Mise en forme des expériences professionnelles...",
  "Optimisation des mots-clés...",
  "Traduction et ajustement du contenu...",
  "Finalisation du document...",
];

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
  const [currentMessage, setCurrentMessage] = useState(generationMessages[0]);
  
  // Changement de message en fonction de la progression
  useEffect(() => {
    if (isGenerating) {
      const messageIndex = Math.min(
        Math.floor((progress / 100) * generationMessages.length),
        generationMessages.length - 1
      );
      setCurrentMessage(generationMessages[messageIndex]);
    }
  }, [progress, isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto shadow-xl animate-fade-in border-0">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
            
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Génération en cours...</h3>
              <p className="text-base text-muted-foreground">
                {cvName 
                  ? `Le CV "${cvName}" est en cours de génération.`
                  : "Votre CV est en cours de génération."}
              </p>
              <p className="text-sm text-muted-foreground">
                Cette opération peut prendre jusqu'à 1 minute 30.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-accent text-base font-medium">{currentMessage}</div>
              <Progress value={progress} className="h-3 bg-gray-300" />
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">{Math.round(progress)}%</span>
              </p>
            </div>
            
            <p className="text-sm text-amber-200 py-2 bg-amber-950/30 rounded-lg">
              Veuillez ne pas fermer cette page pendant la génération
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
