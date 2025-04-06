
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV } from "@/utils/apiService";

export function useCVGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to check if a CV already exists and display it
  const checkExistingCVAndDisplay = async (cvName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder aux CVs",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      setIsChecking(true);

      // Check if CV already exists
      const existingPdfUrl = await checkExistingCV(user, cvName);
      
      if (existingPdfUrl) {
        setPdfUrl(existingPdfUrl);
        toast({
          title: "CV trouvé",
          description: "Le CV existe déjà et a été chargé",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for existing CV:", error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Fonction pour générer le CV après confirmation
  const generateCV = async (cvName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      // First check if CV already exists
      const exists = await checkExistingCVAndDisplay(cvName);
      if (exists) {
        return true;
      }

      // Marquer le début de la génération
      setIsGenerating(true);

      // Appel à l'API de génération via notre service
      const result = await generateCVApi(user, cvName);

      if (result.success && result.pdfPath) {
        setPdfUrl(result.pdfPath);
        
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
    isChecking,
    pdfUrl,
    generateCV,
    checkExistingCVAndDisplay
  };
}
