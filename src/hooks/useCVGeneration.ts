
import { useState } from "react";
import { usePdfViewer } from "./usePdfViewer";
import { useCVApiService } from "./useCVApiService";

export function useCVGeneration() {
  const [checkFailed, setCheckFailed] = useState(false);
  
  const {
    pdfUrl,
    isLoading: isPdfLoading,
    loadFailed,
    getImmediatePdfUrl,
    loadCVPdf,
    handleLoadError,
    resetLoading
  } = usePdfViewer();
  
  const {
    isGenerating,
    isChecking,
    generateCV,
    checkExistingCVAndDisplay
  } = useCVApiService();

  // Retry loading a CV that failed to load
  const retryLoadingCV = (cvName: string) => {
    setCheckFailed(false);
    resetLoading();
    return checkExistingCVAndDisplay(cvName);
  };

  return {
    // Status states
    isGenerating,
    isChecking,
    isPdfLoading,
    checkFailed: loadFailed || checkFailed,
    
    // PDF data
    pdfUrl,
    
    // Actions
    generateCV,
    checkExistingCVAndDisplay,
    loadKnownPdf: loadCVPdf,
    getImmediatePdfUrl,
    handlePdfLoadError: handleLoadError,
    retryLoadingCV
  };
}
