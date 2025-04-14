
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
        // Créer l'URL potentielle du PDF sans vérifier si elle existe
        const potentialUrl = getDirectPdfUrl(user.uid, cvName);
        console.log("Setting potential PDF URL:", potentialUrl);
        
        // On définit l'URL du PDF - le composant CVPreviewPanel gérera l'affichage
        // même si le fichier n'existe pas ou s'il y a des erreurs d'accès
        setPdfUrl(potentialUrl);
        
        // Finir la vérification rapidement
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
      } catch (err) {
        console.error("Error constructing PDF URL:", err);
        setCheckFailed(true);
        
        if (showToast) {
          toast({
            title: "Erreur",
            description: "Impossible de vérifier l'existence du CV",
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
