
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV, getStoragePdfUrl } from "@/utils/apiService";

export function useCVGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to check if a CV already exists and display it
  const checkExistingCVAndDisplay = async (cvName: string, showToast = true) => {
    if (!cvName) return false;
    
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

      // Set checking state
      setIsChecking(true);
      setCheckFailed(false);
      setPdfUrl(null);
      
      console.log(`Checking for existing CV: ${cvName}`);

      // Check if CV already exists
      const existingPdfUrl = await checkExistingCV(user, cvName);
      
      if (existingPdfUrl) {
        setPdfUrl(existingPdfUrl);
        if (showToast) {
          toast({
            title: "CV trouvé",
            description: "Le CV existe déjà et a été chargé",
          });
        }
        console.log("CV found, URL set:", existingPdfUrl);
        return true;
      } else {
        console.log("No existing CV found");
        setCheckFailed(true);
        return false;
      }
    } catch (error) {
      console.error("Error checking for existing CV:", error);
      setCheckFailed(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Essayer de charger directement un PDF connu
  const loadKnownPdf = async (userId: string, cvName: string) => {
    if (!userId || !cvName) return false;
    
    try {
      setIsChecking(true);
      setPdfUrl(null);
      
      console.log(`Attempting to load known PDF: ${cvName} for user ${userId}`);
      
      const url = await getStoragePdfUrl(userId, cvName);
      
      if (url) {
        setPdfUrl(url);
        console.log("Direct PDF loading successful:", url);
        return true;
      } else {
        setCheckFailed(true);
        console.log("Direct PDF loading failed");
        return false;
      }
    } catch (error) {
      console.error("Error in direct PDF loading:", error);
      setCheckFailed(true);
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
      setCheckFailed(false);

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
    checkFailed,
    generateCV,
    checkExistingCVAndDisplay,
    loadKnownPdf
  };
}
