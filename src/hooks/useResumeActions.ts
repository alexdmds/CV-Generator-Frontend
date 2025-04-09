
import { useCallback } from "react";
import { useCVSubmission } from "./useCVSubmission";
import { useCVNameDialog } from "./useCVNameDialog";
import { useConfirmDialog } from "./useConfirmDialog";
import { useCVSaveActions } from "./useCVSaveActions";
import { useCVGeneration } from "./useCVGeneration";

export function useResumeActions(
  cvName: string, 
  setCvName: (name: string) => void, 
  jobDescription: string,
  isEditing: boolean
) {
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  } = useCVNameDialog(isEditing, cvName);
  
  const {
    isSubmitting,
    handleCreateNewCV,
    handleUpdateCV
  } = useCVSubmission();

  const confirmDialog = useConfirmDialog();
  
  const { handleSaveJobDescription } = useCVSaveActions();
  
  const { 
    isGenerating, 
    generateCV,
  } = useCVGeneration();

  // Function to open the confirm dialog
  const openConfirmDialog = useCallback(async () => {
    // Save the job description first without showing a toast
    const saved = await handleSaveJobDescription(cvName, jobDescription, false);
    if (saved) {
      confirmDialog.openDialog();
    }
  }, [confirmDialog, handleSaveJobDescription, cvName, jobDescription]);
  
  // Function to generate the CV after confirmation
  const confirmGenerateCV = useCallback(async () => {
    confirmDialog.closeDialog();
    await generateCV(cvName);
  }, [confirmDialog, generateCV, cvName]);

  // Wrapper for creating new CV with current state values
  const handleCreateNewCVWithState = useCallback(async () => {
    const success = await handleCreateNewCV(cvName, jobDescription);
    if (success) {
      setCvNameDialogOpen(false);
    }
    return success;
  }, [handleCreateNewCV, cvName, jobDescription, setCvNameDialogOpen]);

  return {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    isSubmitting,
    isGenerating,
    openConfirmDialog,
    confirmDialogOpen: confirmDialog.isOpen,
    setConfirmDialogOpen: confirmDialog.setIsOpen,
    confirmGenerateCV,
    handleCreateNewCV: handleCreateNewCVWithState,
    handleSaveJobDescriptionWithState: (showToast = true) => 
      handleSaveJobDescription(cvName, jobDescription, showToast)
  };
}
