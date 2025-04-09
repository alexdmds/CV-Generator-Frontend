
import { useState } from "react";
import { getDirectPdfUrl } from "@/utils/apiService";

export function usePdfUrlManager() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);

  // Get immediate PDF URL without verification
  const getImmediatePdfUrl = (userId: string, cvName: string): string => {
    return getDirectPdfUrl(userId, cvName);
  };

  // Refresh PDF display with timestamp to force reload
  const refreshPdfDisplay = (userId: string, cvName: string) => {
    const refreshedUrl = getImmediatePdfUrl(userId, cvName) + `?t=${Date.now()}`;
    console.log("Refreshing PDF display with URL:", refreshedUrl);
    setPdfUrl(refreshedUrl);
    setLastGenerationTime(Date.now());
    return refreshedUrl;
  };

  // Load a known PDF directly
  const loadKnownPdf = (userId: string, cvName: string): boolean => {
    if (!userId || !cvName) return false;
    
    try {
      const directUrl = getImmediatePdfUrl(userId, cvName);
      setPdfUrl(directUrl);
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
