
import { useState } from "react";
import { getDirectPdfUrl } from "@/utils/apiService";

export function usePdfUrlManager() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);

  // Get immediate PDF URL without verification
  const getImmediatePdfUrl = (userId: string, cvIdOrName: string, cvName?: string): string => {
    return getDirectPdfUrl(userId, cvIdOrName, cvName);
  };

  // Refresh PDF display with timestamp to force reload
  const refreshPdfDisplay = (userId: string, cvIdOrName: string, cvName?: string) => {
    const refreshedUrl = getImmediatePdfUrl(userId, cvIdOrName, cvName) + `?t=${Date.now()}`;
    console.log("Refreshing PDF display with URL:", refreshedUrl);
    setPdfUrl(refreshedUrl);
    setLastGenerationTime(Date.now());
    return refreshedUrl;
  };

  // Load a known PDF directly
  const loadKnownPdf = (userId: string, cvIdOrName: string, cvName?: string): boolean => {
    if (!userId || !cvIdOrName) return false;
    
    try {
      const directUrl = getImmediatePdfUrl(userId, cvIdOrName, cvName);
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
