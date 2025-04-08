
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl, getStoragePdfUrl } from "@/utils/apiService";
import { useToast } from "@/components/ui/use-toast";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/components/auth/firebase-config";

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
      
      // Vérifier si l'URL contient un token valide
      if (!pdfUrl.includes('token=')) {
        console.log("Adding token to URL for better accessibility");
        const newUrl = pdfUrl.includes('?') 
          ? `${pdfUrl}&token=public` 
          : `${pdfUrl}?token=public`;
        
        // Ne pas mettre à jour l'URL si elle contient déjà un token
        if (pdfUrl !== newUrl) {
          console.log("Updating URL with token:", newUrl);
          setPdfUrl(newUrl);
        }
      }
    }
  }, [pdfUrl]);

  // Récupère l'URL directe d'un PDF dans Firebase Storage
  const getImmediatePdfUrl = useCallback((userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  }, []);

  // Obtenir l'URL de téléchargement via Firebase Storage
  const getDownloadPdfUrl = useCallback(async (userId: string, cvName: string): Promise<string | null> => {
    try {
      const fileRef = ref(storage, `${userId}/cvs/${cvName}.pdf`);
      const url = await getDownloadURL(fileRef);
      console.log("Got download URL:", url);
      return url;
    } catch (error) {
      console.warn("Failed to get download URL, falling back to direct URL:", error);
      return getDirectPdfUrl(userId, cvName);
    }
  }, []);

  // Définir une URL de PDF directement
  const loadPdf = useCallback((url: string) => {
    console.log("Loading PDF directly with URL:", url);
    setPdfUrl(url);
    setLoadFailed(false);
  }, []);

  // Charger un PDF pour un CV connu
  const loadCVPdf = useCallback((cvName: string): boolean => {
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
      
      // Essayer d'obtenir une URL de téléchargement fiable
      const attemptLoadWithDownloadUrl = async () => {
        try {
          const downloadUrl = await getDownloadPdfUrl(user.uid, cvName);
          if (downloadUrl) {
            console.log("Setting download URL:", downloadUrl);
            setPdfUrl(downloadUrl);
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error getting download URL:", error);
          // Fallback vers URL directe
          const directUrl = getDirectPdfUrl(user.uid, cvName);
          console.log("Falling back to direct URL:", directUrl);
          setPdfUrl(directUrl);
          return true;
        } finally {
          setIsLoading(false);
        }
      };
      
      // Définir d'abord l'URL directe pour un chargement rapide
      const directUrl = getDirectPdfUrl(user.uid, cvName);
      console.log(`Loading PDF for CV "${cvName}" with direct URL: ${directUrl}`);
      setPdfUrl(directUrl);
      
      // Puis tenter d'obtenir une URL de téléchargement en arrière-plan
      attemptLoadWithDownloadUrl();
      
      return true;
    } catch (error) {
      console.error("Error loading PDF:", error);
      setLoadFailed(true);
      setIsLoading(false);
      return false;
    }
  }, [getDownloadPdfUrl]);

  // Marquer le chargement du PDF comme échoué
  const handleLoadError = useCallback(() => {
    console.error("Failed to load PDF in viewer");
    setLoadFailed(true);
    
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger le PDF dans l'aperçu. Essayez de le télécharger directement.",
      variant: "destructive",
    });
  }, [toast]);

  // Réinitialiser l'état de chargement pour réessayer
  const resetLoading = useCallback(() => {
    setLoadFailed(false);
    setIsLoading(false);
  }, []);

  return {
    pdfUrl,
    setPdfUrl,
    isLoading,
    setIsLoading,
    loadFailed,
    setLoadFailed,
    getImmediatePdfUrl,
    getDownloadPdfUrl,
    loadPdf,
    loadCVPdf,
    handleLoadError,
    resetLoading
  };
}
