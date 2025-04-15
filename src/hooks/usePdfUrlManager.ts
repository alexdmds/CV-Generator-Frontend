
import { useState, useEffect } from "react";
import { getDirectPdfUrl } from "@/utils/apiService";

export function usePdfUrlManager() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);

  // Get immediate PDF URL without verification
  const getImmediatePdfUrl = (userId: string, cvIdOrName: string, cvName?: string): string => {
    const url = getDirectPdfUrl(userId, cvIdOrName, cvName);
    console.log("Generated immediate PDF URL:", url);
    return url;
  };

  // Refresh PDF display with timestamp to force reload
  const refreshPdfDisplay = (userId: string, cvIdOrName: string, cvName?: string) => {
    const baseUrl = getImmediatePdfUrl(userId, cvIdOrName, cvName);
    const refreshedUrl = `${baseUrl}?t=${Date.now()}`;
    console.log("Refreshing PDF display with URL:", refreshedUrl);
    setPdfUrl(refreshedUrl);
    setLastGenerationTime(Date.now());
    return refreshedUrl;
  };

  // Load a known PDF directly
  const loadKnownPdf = (userId: string, cvIdOrName: string, cvName?: string): boolean => {
    if (!userId || !cvIdOrName) {
      console.error("Missing required parameters for loadKnownPdf:", { userId, cvIdOrName });
      return false;
    }
    
    try {
      const directUrl = getImmediatePdfUrl(userId, cvIdOrName, cvName);
      console.log("Loading known PDF at URL:", directUrl);
      // Ajout du timestamp pour éviter les problèmes de cache
      setPdfUrl(`${directUrl}?t=${Date.now()}`);
      return true;
    } catch (error) {
      console.error("Error in direct PDF loading:", error);
      return false;
    }
  };

  return {
    pdfUrl,
    setPdfUrl,
    lastGenerationTime,
    getImmediatePdfUrl,
    refreshPdfDisplay,
    loadKnownPdf
  };
}
