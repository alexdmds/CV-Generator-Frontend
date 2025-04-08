
import { useCVData } from "./useCVData";
import { useCVNameDialog } from "./useCVNameDialog";
import { useCVSubmission } from "./useCVSubmission";
import { useCVGeneration } from "./useCVGeneration";
import { useCVInitialization } from "./useCVInitialization";
import { useCVSaving } from "./useCVSaving";
import { useCVGenDialog } from "./useCVGenDialog";

export function useResumeForm() {
  const {
    jobDescription,
    setJobDescription,
    cvName,
    setCvName,
    isEditing
  } = useCVData();
  
  // CV name dialog management
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  } = useCVNameDialog(isEditing, cvName);
  
  // CV submission logic
  const {
    isSubmitting,
    handleCreateNewCV: baseHandleCreateNewCV,
    handleUpdateCV
  } = useCVSubmission();

  // CV initialization and checking
  const {
    checkForExistingCV,
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV,
    navigate
  } = useCVInitialization();

  // CV saving functionality
  const { handleSaveJobDescription: baseSaveJobDescription } = useCVSaving();

  // CV generation dialog
  const {
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleGenerateResume,
    confirmGenerateCV
  } = useCVGenDialog({ cvName, jobDescription });
  
  // Using CV generation hook
  const { 
    isGenerating, 
    isChecking,
    pdfUrl
  } = useCVGeneration();

  // Wrapper for saving job description with current state
  const handleSaveJobDescription = async (showToast = true) => {
    return baseSaveJobDescription({
      cvName,
      jobDescription,
      showToast
    });
  };
  
  // Wrapper for creating new CV with current state values
  const handleCreateNewCVWithState = async () => {
    const success = await baseHandleCreateNewCV(cvName, jobDescription);
    if (success) {
      setCvNameDialogOpen(false);
    }
    return success;
  };

  return {
    // CV data
    jobDescription,
    setJobDescription,
    cvName,
    setCvName,
    isEditing,
    
    // Dialog state
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    
    // Submission state
    isSubmitting,
    
    // Actions
    handleGenerateResume,
    handleCreateNewCV: handleCreateNewCVWithState,
    handleSaveJobDescription,
    
    // Navigation
    navigate,
    
    // Confirmation dialog
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmGenerateCV,
    
    // Generation state
    isGenerating,
    isChecking,
    pdfUrl,
    
    // CV checking
    checkForExistingCV,
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV
  };
}
