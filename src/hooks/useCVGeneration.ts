
import { usePdfUrlManager } from "./usePdfUrlManager";
import { useCVExistenceCheck } from "./useCVExistenceCheck";
import { useCVGenerationProcess } from "./useCVGenerationProcess";

export function useCVGeneration() {
  // Use the PDF URL manager hook
  const {
    pdfUrl,
    setPdfUrl,
    lastGenerationTime,
    getImmediatePdfUrl,
    refreshPdfDisplay,
    loadKnownPdf
  } = usePdfUrlManager();

  // Use the CV existence check hook
  const {
    isChecking,
    checkFailed,
    checkExistingCVAndDisplay,
    retryCheckForExistingCV
  } = useCVExistenceCheck(setPdfUrl);

  // Use the CV generation process hook
  const {
    isGenerating,
    progress,
    generateCV
  } = useCVGenerationProcess(refreshPdfDisplay);

  return {
    // PDF URL management
    pdfUrl,
    setPdfUrl,
    lastGenerationTime,
    getImmediatePdfUrl,
    refreshPdfDisplay,
    loadKnownPdf,
    
    // CV existence checking
    isChecking,
    checkFailed,
    checkExistingCVAndDisplay,
    retryCheckForExistingCV: (cvName: string) => retryCheckForExistingCV(cvName),
    
    // CV generation
    isGenerating,
    progress,
    generateCV
  };
}
