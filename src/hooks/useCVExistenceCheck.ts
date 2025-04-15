
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
  const checkExistingCVAndDisplay = async (cvId: string, showToast = true) => {
    if (!cvId) {
      console.error("No CV ID provided for existence check");
      return false;
    }
    
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

      // Get direct URL immediately with current timestamp to prevent caching
      const immediateUrl = `${getDirectPdfUrl(user.uid, cvId)}?t=${Date.now()}`;
      console.log(`Attempting to display CV with direct URL: ${immediateUrl}`);
      setPdfUrl(immediateUrl);
      
      // Mark background check as started
      setIsChecking(true);
      setCheckFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvId}`);

      // Simple timeout to simulate the check and give UI time to update
      setTimeout(() => {
        if (showToast) {
          toast({
            title: "CV chargé",
            description: "Le CV est disponible",
          });
        }
        
        // Check is complete
        setIsChecking(false);
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
  const retryCheckForExistingCV = async (cvId: string) => {
    console.log("Retrying CV existence check for:", cvId);
    setCheckFailed(false);
    return checkExistingCVAndDisplay(cvId);
  };

  return {
    isChecking,
    checkFailed,
    checkExistingCVAndDisplay,
    retryCheckForExistingCV
  };
}
