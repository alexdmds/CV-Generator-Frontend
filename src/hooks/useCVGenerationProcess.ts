
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi } from "@/utils/apiService";

export function useCVGenerationProcess(refreshPdfDisplay: (userId: string, cvName: string) => string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Generate a CV
  const generateCV = async (cvName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        return false;
      }

      // Mark generation as started
      setIsGenerating(true);

      // Call generation API
      const result = await generateCVApi(user, cvName);

      if (result.success && result.pdfPath) {
        // Refresh display with timestamp to force cache refresh
        refreshPdfDisplay(user.uid, cvName);
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        return true;
      } else {
        throw new Error(result.message || "Échec de la génération du CV");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateCV
  };
}
