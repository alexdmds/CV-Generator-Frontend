
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

  // Use the CV generation process hook - remove the argument from here
  const {
    isGenerating,
    progress,
    generateCV
  } = useCVGenerationProcess();

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
    
    // CV generation - ensure ID is passed through
    isGenerating,
    progress,
    generateCV: (cvId: string) => {
      console.log("useCVGeneration.generateCV called with ID:", cvId);
      return generateCV(cvId);
    }
  };
}
