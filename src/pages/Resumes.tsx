
import { ResumeList } from "@/components/resume/ResumeList";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalGenerationIndicator } from "@/components/resume/components/GlobalGenerationIndicator";
import { useState, useEffect } from "react";

const Resumes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatingCVName, setGeneratingCVName] = useState<string | undefined>();
  
  // Écouter les événements liés à la génération de CV
  useEffect(() => {
    // Fonction pour démarrer la génération
    const handleGenerationStart = (event: CustomEvent) => {
      setIsGenerating(true);
      setProgress(event.detail.progress || 5);
      setGeneratingCVName(event.detail.cvName);
      console.log("CV generation started:", event.detail);
    };
    
    // Fonction pour mettre à jour la progression
    const handleGenerationProgress = (event: CustomEvent) => {
      if (isGenerating) { // Vérifier que la génération est toujours en cours
        setProgress(event.detail.progress || 0);
        console.log("CV generation progress:", event.detail.progress);
      }
    };
    
    // Fonction pour terminer la génération
    const handleGenerationComplete = (event: CustomEvent) => {
      setProgress(100);
      // Laisser le temps à l'utilisateur de voir le 100%
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        console.log("CV generation completed");
      }, 1500);
    };
    
    // Fonction pour gérer les annulations de génération
    const handleGenerationCancel = () => {
      setIsGenerating(false);
      setProgress(0);
      console.log("CV generation cancelled");
    };
    
    // Écouter les événements personnalisés
    window.addEventListener('cv-generation-start', handleGenerationStart as EventListener);
    window.addEventListener('cv-generation-progress', handleGenerationProgress as EventListener);
    window.addEventListener('cv-generation-complete', handleGenerationComplete as EventListener);
    window.addEventListener('cv-generation-cancel', handleGenerationCancel as EventListener);
    
    // Nettoyage des écouteurs d'événements
    return () => {
      window.removeEventListener('cv-generation-start', handleGenerationStart as EventListener);
      window.removeEventListener('cv-generation-progress', handleGenerationProgress as EventListener);
      window.removeEventListener('cv-generation-complete', handleGenerationComplete as EventListener);
      window.removeEventListener('cv-generation-cancel', handleGenerationCancel as EventListener);
    };
  }, [isGenerating]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Mes CVs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gérez vos CVs personnalisés basés sur votre profil
            </p>
          </CardHeader>
          <CardContent>
            <ResumeList />
          </CardContent>
        </Card>
      </div>
      
      {/* Indicateur de génération global */}
      <GlobalGenerationIndicator 
        isGenerating={isGenerating} 
        progress={progress} 
        cvName={generatingCVName}
      />
    </div>
  );
};

export default Resumes;
