
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileGenerationLoaderProps {
  onTimeout: () => void;
}

export const ProfileGenerationLoader = ({ onTimeout }: ProfileGenerationLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const maxDuration = 90; // 90 secondes (1min30)

  useEffect(() => {
    console.log("ProfileGenerationLoader monté");
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsedTime / maxDuration) * 100, 100);
      
      setProgress(newProgress);
      console.log(`Progression: ${Math.round(newProgress)}%`);
      
      if (elapsedTime >= maxDuration) {
        clearInterval(interval);
        console.log("Timeout atteint");
        onTimeout();
      }
    }, 1000);

    return () => {
      console.log("ProfileGenerationLoader démonté, intervalle nettoyé");
      clearInterval(interval);
    };
  }, [onTimeout, maxDuration]);

  return (
    <Card className="w-full max-w-2xl mx-auto animate-pulse">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          Génération du profil en cours...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Nous analysons vos documents et générons votre profil. Cette opération peut prendre jusqu'à 1 minute 30.
            </p>
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
