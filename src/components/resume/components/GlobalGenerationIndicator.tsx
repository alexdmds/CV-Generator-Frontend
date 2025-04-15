
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

// More detailed generation messages
const generationMessages = [
  "Analyse de la fiche de poste...",
  "Extraction des compétences clés...",
  "Adaptation du profil au poste...",
  "Sélection des expériences pertinentes...",
  "Mise en forme professionnelle...",
  "Optimisation des mots-clés...",
  "Traduction et ajustement du contenu...",
  "Vérification de la cohérence...",
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
  
  // More dynamic message changes
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto shadow-2xl animate-fade-in border-0 bg-gray-900/90">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-white">Génération en cours...</h3>
              <p className="text-base text-blue-200">
                {cvName 
                  ? `Le CV "${cvName}" est en cours de génération.`
                  : "Votre CV est en cours de génération."}
              </p>
              <p className="text-sm text-gray-400">
                Cette opération peut prendre jusqu'à 1 minute 30.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-blue-300 text-base font-medium">{currentMessage}</div>
              <Progress 
                value={progress} 
                className="h-3 bg-gray-800 border border-blue-900/50" 
                indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
              />
              <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="font-medium">{Math.round(progress)}%</span>
              </p>
            </div>
            
            <p className="text-sm text-amber-200 py-2 bg-amber-950/30 rounded-lg border border-amber-900/50">
              Veuillez ne pas fermer cette page pendant la génération
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
