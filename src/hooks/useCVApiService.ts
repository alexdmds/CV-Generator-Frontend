
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV } from "@/utils/apiService";
import { usePdfViewer } from "./usePdfViewer";

export function useCVApiService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    setPdfUrl, 
    getImmediatePdfUrl, 
    setLoadFailed 
  } = usePdfViewer();

  // Check if a CV exists on Firebase Storage and set up the PDF URL
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

      // Set the PDF URL immediately without waiting for verification
      const immediateUrl = getImmediatePdfUrl(user.uid, cvName);
      setPdfUrl(immediateUrl);
      
      // Start background check
      setIsChecking(true);
      setLoadFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvName}`);

      // Background checking process
      setTimeout(async () => {
        try {
          if (showToast) {
            toast({
              title: "CV chargé",
              description: "Le CV est disponible",
            });
          }
        } catch (error) {
          console.error("Background check error:", error);
        } finally {
          setIsChecking(false);
        }
      }, 0);
      
      return true;
    } catch (error) {
      console.error("Error in immediate PDF access:", error);
      setLoadFailed(true);
      setIsChecking(false);
      return false;
    }
  };

  // Call the CV generation API
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

      setIsGenerating(true);
      setLoadFailed(false);

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
    generateCV,
    checkExistingCVAndDisplay
  };
}
