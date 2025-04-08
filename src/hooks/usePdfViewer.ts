
import { useState, useEffect } from "react";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl } from "@/utils/apiService";
import { useToast } from "@/components/ui/use-toast";

export function usePdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { toast } = useToast();

  // Vérifier si l'URL est directement accessible
  useEffect(() => {
    if (pdfUrl) {
      // Vérifier si l'URL est accessible via une requête HEAD
      const checkPdfAccessibility = async () => {
        try {
          const response = await fetch(pdfUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.error(`PDF accessibility check failed: ${response.status} ${response.statusText}`);
            setLoadFailed(true);
          } else {
            setLoadFailed(false);
            console.log("PDF accessibility check passed");
          }
        } catch (error) {
          console.error("Error checking PDF accessibility:", error);
          // Ne pas marquer comme échoué pour permettre à l'iframe de tenter le chargement
        }
      };
      
      checkPdfAccessibility();
    }
  }, [pdfUrl]);

  // Get direct URL to a PDF in Firebase Storage with double encoding for special characters
  const getImmediatePdfUrl = (userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  };

  // Set a PDF URL directly without verification
  const loadPdf = (url: string) => {
    setPdfUrl(url);
    setLoadFailed(false);
  };

  // Load a PDF for a known CV
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
      
      const directUrl = getImmediatePdfUrl(user.uid, cvName);
      console.log(`Loading PDF at URL: ${directUrl}`);
      setPdfUrl(directUrl);
      setLoadFailed(false);
      
      return true;
    } catch (error) {
      console.error("Error loading PDF:", error);
      setLoadFailed(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark PDF loading as failed
  const handleLoadError = () => {
    console.error("Failed to load PDF in viewer");
    setLoadFailed(true);
    
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger le PDF. Essayez de le télécharger directement.",
      variant: "destructive",
    });
  };

  // Reset the loading state to try again
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
