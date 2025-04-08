
import { useState, useEffect } from "react";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl } from "@/utils/apiService";
import { useToast } from "@/components/ui/use-toast";

export function usePdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { toast } = useToast();

  // Surveiller les changements d'URL et vérifier si le PDF est accessible
  useEffect(() => {
    if (pdfUrl) {
      console.log("PDF URL updated:", pdfUrl);
      
      // Pas de vérification immédiate par fetch car les CORS peuvent bloquer
      // Mais on réinitialise l'état d'erreur pour donner une nouvelle chance
      setLoadFailed(false);
    }
  }, [pdfUrl]);

  // Récupère l'URL directe d'un PDF dans Firebase Storage en encodant correctement le nom
  const getImmediatePdfUrl = (userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  };

  // Définir une URL de PDF directement
  const loadPdf = (url: string) => {
    setPdfUrl(url);
    setLoadFailed(false);
  };

  // Charger un PDF pour un CV connu
  const loadCVPdf = (cvName: string): boolean => {
    if (!cvName) return false;
    
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No user found when trying to load PDF");
        setLoadFailed(true);
        setIsLoading(false);
        return false;
      }
      
      // URL construite avec encodage double pour gérer les caractères spéciaux
      const directUrl = getImmediatePdfUrl(user.uid, cvName);
      console.log(`Loading PDF at URL: ${directUrl}`);
      setPdfUrl(directUrl);
      
      return true;
    } catch (error) {
      console.error("Error loading PDF:", error);
      setLoadFailed(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer le chargement du PDF comme échoué
  const handleLoadError = () => {
    console.error("Failed to load PDF in viewer");
    setLoadFailed(true);
    
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger le PDF. Essayez de le télécharger directement.",
      variant: "destructive",
    });
  };

  // Réinitialiser l'état de chargement pour réessayer
  const resetLoading = () => {
    setLoadFailed(false);
    setIsLoading(false);
  };

  return {
    pdfUrl,
    setPdfUrl,
    isLoading,
    setIsLoading,
    loadFailed,
    setLoadFailed,
    getImmediatePdfUrl,
    loadPdf,
    loadCVPdf,
    handleLoadError,
    resetLoading
  };
}
