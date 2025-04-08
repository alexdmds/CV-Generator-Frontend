
import { useState, useEffect } from "react";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl } from "@/utils/apiService";
import { useToast } from "@/components/ui/use-toast";

export function usePdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { toast } = useToast();

  // Surveiller les changements d'URL et effectuer des actions
  useEffect(() => {
    if (pdfUrl) {
      console.log("PDF URL updated in usePdfViewer:", pdfUrl);
      
      // Réinitialiser l'état d'erreur quand l'URL change
      setLoadFailed(false);
      
      // Tester l'accessibilité de l'URL en arrière-plan sans bloquer l'interface
      const testAccessibility = async () => {
        try {
          // Utiliser fetch avec no-cors pour éviter les problèmes CORS
          const response = await fetch(pdfUrl, { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          console.log("PDF URL seems accessible");
        } catch (error) {
          // Ne pas marquer comme échoué ici, laisser l'iframe essayer
          console.warn("PDF URL might not be directly accessible:", error);
        }
      };
      
      testAccessibility();
    }
  }, [pdfUrl]);

  // Récupère l'URL directe d'un PDF dans Firebase Storage
  const getImmediatePdfUrl = (userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  };

  // Définir une URL de PDF directement
  const loadPdf = (url: string) => {
    console.log("Loading PDF directly with URL:", url);
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
      
      // URL construite avec encodage approprié
      const directUrl = getImmediatePdfUrl(user.uid, cvName);
      console.log(`Loading PDF for CV "${cvName}" at URL: ${directUrl}`);
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
      description: "Impossible de charger le PDF dans l'aperçu. Essayez de le télécharger directement.",
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
