
import { useState } from "react";
import { auth } from "@/components/auth/firebase-config";
import { getDirectPdfUrl } from "@/utils/apiService";

export function usePdfViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // Get direct URL to a PDF in Firebase Storage
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
    console.error("Failed to load PDF");
    setLoadFailed(true);
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
