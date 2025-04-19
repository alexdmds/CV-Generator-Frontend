
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileGenerationLoaderProps {
  onTimeout: () => void;
}

export const ProfileGenerationLoader = ({ onTimeout }: ProfileGenerationLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const maxDuration = 90; // 90 secondes (1min30)

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsedTime / maxDuration) * 100, 100);
      
      setProgress(newProgress);
      
      if (elapsedTime >= maxDuration) {
        clearInterval(interval);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeout]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Génération de votre profil</h3>
            <p className="text-sm text-muted-foreground">
              Cette opération peut prendre jusqu'à 1 minute 30. Merci de patienter...
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
