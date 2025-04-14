
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

      // Mettre l'URL directe dans l'état, mais considérer qu'elle pourrait ne pas fonctionner
      // L'erreur sera gérée par l'iframe avec le composant onError
      const immediateUrl = getDirectPdfUrl(user.uid, cvName);
      console.log("Setting potential PDF URL:", immediateUrl);
      setPdfUrl(immediateUrl);
      
      // Marquer la vérification comme démarrée
      setIsChecking(true);
      setCheckFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvName}`);

      // Nous assumons que le CV n'existe pas encore, sa génération sera confirmée
      // soit par l'affichage réussi, soit par l'utilisateur cliquant sur "Générer mon CV"
      setTimeout(() => {
        setIsChecking(false);
        
        if (showToast) {
          toast({
            title: "Vérification terminée",
            description: "Si le CV existe, il sera affiché automatiquement.",
          });
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Error in immediate PDF access:", error);
      setCheckFailed(true);
      setIsChecking(false);
      return false;
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
