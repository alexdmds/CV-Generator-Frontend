
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

      // Get direct URL immediately
      const immediateUrl = getDirectPdfUrl(user.uid, cvName);
      setPdfUrl(immediateUrl);
      
      // Mark background check as started
      setIsChecking(true);
      setCheckFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvName}`);

      // Verify in background but don't block UI
      setTimeout(async () => {
        try {
          if (showToast) {
            toast({
              title: "CV chargé",
              description: "Le CV est disponible",
            });
          }
          
          // Check is complete
          setIsChecking(false);
        } catch (error) {
          console.error("Background check error:", error);
          setIsChecking(false);
        }
      }, 0);
      
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
