
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl, checkCVExists } from "@/utils/apiService";

export function useCVExistenceCheck(setPdfUrl: (url: string | null) => void) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [cvExists, setCvExists] = useState<boolean | null>(null);
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
      
      console.log(`Vérification fiable de l'existence du CV: ${cvName}`);
      
      // On utilise notre fonction améliorée pour vérifier l'existence
      const exists = await checkCVExists(user.uid, cvName);
      setCvExists(exists);
      
      if (exists) {
        // Le CV existe, on définit l'URL
        const directUrl = getDirectPdfUrl(user.uid, cvName);
        console.log("CV trouvé, URL définie:", directUrl);
        setPdfUrl(directUrl);
        
        if (showToast) {
          toast({
            title: "CV trouvé",
            description: "L'aperçu du CV a été chargé avec succès.",
          });
        }
        
        setIsChecking(false);
        return true;
      } else {
        // Le CV n'existe pas
        console.log("CV introuvable");
        setPdfUrl(null);
        
        if (showToast) {
          toast({
            title: "CV introuvable",
            description: "Aucun CV n'a été trouvé avec ce nom.",
            variant: "destructive",
          });
        }
        
        setCheckFailed(true);
        setIsChecking(false);
        return false;
      }
    } catch (error) {
      console.error("Error in CV existence check:", error);
      setCheckFailed(true);
      setPdfUrl(null);
      setCvExists(false);
      
      if (showToast) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'existence du CV",
          variant: "destructive",
        });
      }
      
      setIsChecking(false);
      return false;
    }
  };

  // Retry checking for an existing CV
  const retryCheckForExistingCV = async (cvName: string) => {
    setCheckFailed(false);
    setCvExists(null);
    return checkExistingCVAndDisplay(cvName);
  };

  return {
    isChecking,
    checkFailed,
    cvExists,
    checkExistingCVAndDisplay,
    retryCheckForExistingCV
  };
}
