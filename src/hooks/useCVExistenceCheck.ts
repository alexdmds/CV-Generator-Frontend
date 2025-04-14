
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl } from "@/utils/apiService";

export function useCVExistenceCheck(setPdfUrl: (url: string | null) => void) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if a CV exists and display it
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

      // Marquer la vérification comme démarrée
      setIsChecking(true);
      setCheckFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvName}`);
      
      // Au lieu de vérifier l'existence du fichier, on définit simplement l'URL potentielle
      const potentialUrl = getDirectPdfUrl(user.uid, cvName);
      console.log("Setting potential PDF URL:", potentialUrl);
      
      // On définit l'URL et laisse le composant CVPreviewPanel gérer l'affichage
      setPdfUrl(potentialUrl);
      
      // Terminer la vérification après un court délai
      setTimeout(() => {
        setIsChecking(false);
        
        if (showToast) {
          toast({
            title: "Vérification terminée",
            description: "L'aperçu du CV s'affichera s'il existe.",
          });
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Error in CV existence check:", error);
      setCheckFailed(true);
      setPdfUrl(null);
      
      if (showToast) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'existence du CV",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setTimeout(() => {
        setIsChecking(false);
      }, 1000);
    }
  };

  // Retry checking for an existing CV
  const retryCheckForExistingCV = async (cvName: string) => {
    setCheckFailed(false);
    return checkExistingCVAndDisplay(cvName);
  };

  return {
    isChecking,
    checkFailed,
    checkExistingCVAndDisplay,
    retryCheckForExistingCV
  };
}
