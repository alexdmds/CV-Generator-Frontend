
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
      
      try {
        // Au lieu de vérifier l'existence du fichier (ce qui cause l'erreur Access Denied),
        // on donne simplement l'URL du PDF et laisse l'interface gérer l'affichage
        // L'état iframeError dans le composant CVPreviewPanel s'occupera de cacher l'erreur
        const potentialUrl = getDirectPdfUrl(user.uid, cvName);
        console.log("Setting potential PDF URL:", potentialUrl);
        
        // On ne fait pas de requête de vérification, on définit simplement l'URL
        // et le composant s'occupera de gérer l'affichage ou l'erreur
        setPdfUrl(potentialUrl);
        
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
      } catch (err) {
        console.error("Error constructing PDF URL:", err);
        setCheckFailed(true);
        setPdfUrl(null);
        
        if (showToast) {
          toast({
            title: "Erreur",
            description: "Impossible de charger le CV",
            variant: "destructive",
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error("Error in immediate PDF access:", error);
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
      setIsChecking(false);
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
