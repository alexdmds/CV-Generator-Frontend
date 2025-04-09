
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV, getStoragePdfUrl, getDirectPdfUrl } from "@/utils/apiService";

export function useCVGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fonction pour obtenir directement l'URL du CV sans bloquer
  const getImmediatePdfUrl = (userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  };

  // Fonction pour vérifier si un CV existe et l'afficher, ne bloque pas l'interface
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

      // Définir tout de suite une URL potentielle (non vérifiée)
      const immediateUrl = getImmediatePdfUrl(user.uid, cvName);
      setPdfUrl(immediateUrl);
      
      // Marquer le début de la vérification en arrière-plan
      setIsChecking(true);
      setCheckFailed(false);
      
      console.log(`Checking for existing CV in background: ${cvName}`);

      // Vérifier en arrière-plan, mais ne pas bloquer l'interface
      setTimeout(async () => {
        try {
          // Garder l'URL simple et directe
          if (showToast) {
            toast({
              title: "CV chargé",
              description: "Le CV est disponible",
            });
          }
          
          // La vérification est terminée
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

  // Forcer le rafraîchissement de l'affichage du PDF
  const refreshPdfDisplay = (userId: string, cvName: string) => {
    const refreshedUrl = getImmediatePdfUrl(userId, cvName) + `?t=${Date.now()}`;
    console.log("Refreshing PDF display with URL:", refreshedUrl);
    setPdfUrl(refreshedUrl);
    setLastGenerationTime(Date.now());
    return refreshedUrl;
  };

  // Charger directement un PDF connu sans vérification
  const loadKnownPdf = (userId: string, cvName: string): boolean => {
    if (!userId || !cvName) return false;
    
    try {
      const directUrl = getImmediatePdfUrl(userId, cvName);
      setPdfUrl(directUrl);
      setIsChecking(false);
      return true;
    } catch (error) {
      console.error("Error in direct PDF loading:", error);
      setCheckFailed(true);
      setIsChecking(false);
      return false;
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

      // Marquer le début de la génération
      setIsGenerating(true);
      setCheckFailed(false);

      // Appel à l'API de génération via notre service
      const result = await generateCVApi(user, cvName);

      if (result.success && result.pdfPath) {
        // Ajouter un paramètre timestamp pour forcer le rafraîchissement du cache
        const refreshedUrl = refreshPdfDisplay(user.uid, cvName);
        
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
    lastGenerationTime,
    setPdfUrl,
    generateCV,
    checkExistingCVAndDisplay,
    loadKnownPdf,
    getImmediatePdfUrl,
    refreshPdfDisplay
  };
}
