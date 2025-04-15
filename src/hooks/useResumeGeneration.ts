
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCVGenerationEvents } from "./useCVGenerationEvents";
import { useCVGeneration } from "./useCVGeneration";

/**
 * Hook for handling the CV generation process
 */
export function useResumeGeneration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startGenerationProgress, completeGenerationProgress } = useCVGenerationEvents();
  const { generateCV } = useCVGeneration();

  const handleGenerateResume = async (cvId: string | null, cvName: string | null) => {
    if (!cvId) {
      console.error("No pending CV ID for generation");
      toast({
        title: "Erreur",
        description: "Impossible de générer le CV sans identifiant",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Starting generation for CV ID:", cvId);
    
    try {
      setIsSubmitting(true);
      
      // Start progress animation
      const progressIntervals = startGenerationProgress(cvId, cvName);
      
      // Call the CV generation API
      const success = await generateCV(cvId);
      
      // Clean up all intervals
      progressIntervals.forEach(interval => clearInterval(interval));
      
      // Complete the progress indicator
      completeGenerationProgress(cvId, success);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Votre CV a été généré avec succès",
        });
        
        // Navigate to the CV preview page
        setTimeout(() => {
          navigate(`/resumes/${cvId}`);
        }, 1000);
        
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du CV",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in handleGenerateResume:", error);
      
      // Complete with error
      completeGenerationProgress(cvId, false, error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleGenerateResume
  };
}
