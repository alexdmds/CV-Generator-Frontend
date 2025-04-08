
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV, getDirectPdfUrl } from "@/utils/apiService";
import { usePdfViewer } from "./usePdfViewer";

export function useCVApiService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    setPdfUrl,
    setLoadFailed,
    getDownloadPdfUrl,
  } = usePdfViewer();

  // Check if a CV exists on Firebase Storage and set up the PDF URL
  const checkExistingCVAndDisplay = useCallback(async (cvName: string, showToast = true) => {
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

      // Début de la vérification
      setIsChecking(true);
      setLoadFailed(false);
      console.log(`Checking for existing CV: ${cvName}`);

      // Définir l'URL directe immédiatement pour un chargement rapide
      const immediateUrl = getDirectPdfUrl(user.uid, cvName);
      console.log("Setting immediate PDF URL:", immediateUrl);
      setPdfUrl(immediateUrl);
      
      // Puis tenter d'obtenir une URL de téléchargement plus fiable
      try {
        const downloadUrl = await getDownloadPdfUrl(user.uid, cvName);
        if (downloadUrl) {
          console.log("Setting download URL:", downloadUrl);
          setPdfUrl(downloadUrl);
        }
      } catch (error) {
        console.warn("Error getting download URL, continuing with direct URL:", error);
      }
      
      // En arrière-plan, vérifier si le CV existe réellement
      const pdfUrl = await checkExistingCV(user, cvName);
      
      if (pdfUrl) {
        console.log("CV found with URL:", pdfUrl);
        setPdfUrl(pdfUrl);
        
        if (showToast) {
          toast({
            title: "CV trouvé",
            description: "Le CV est disponible",
          });
        }
        return true;
      } else {
        console.log("CV not found or inaccessible");
        setLoadFailed(true);
        if (showToast) {
          toast({
            title: "CV non trouvé",
            description: "Aucun CV n'a été trouvé avec ce nom",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error checking for existing CV:", error);
      setLoadFailed(true);
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
  }, [getDownloadPdfUrl, navigate, setPdfUrl, setLoadFailed, toast]);

  // Call the CV generation API
  const generateCV = useCallback(async (cvName: string) => {
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
        console.log("CV generated successfully, setting PDF URL:", result.pdfPath);
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
  }, [navigate, setPdfUrl, setLoadFailed, toast]);

  return {
    isGenerating,
    isChecking,
    generateCV,
    checkExistingCVAndDisplay
  };
}
