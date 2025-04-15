
import { useEffect } from "react";
import { useCVData } from "../useCVData";
import { useCVInitialization } from "../useCVInitialization";
import { useCVGeneration } from "../useCVGeneration";
import { useFormData } from "./useFormData";
import { useFormValidation } from "./useFormValidation";
import { useDialogStates } from "./useDialogStates";
import { useFormActions } from "./useFormActions";
import { useFormHandlers } from "./useFormHandlers";
import { useResumeActions } from "../useResumeActions";

export function useResumeForm() {
  // Core data and state hooks
  const { jobDescription, setJobDescription, cvName, setCvName } = useFormData();
  const { isEditing, id } = useCVData();
  
  // Validation and initialization hooks
  const {
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    setIsCheckingInProgress,
    checkFailed,
    setCheckFailed
  } = useFormValidation();
  
  const { navigate, retryCheckForExistingCV: initRetryCheck } = useCVInitialization();
  
  // Dialog state hooks
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen
  } = useDialogStates();

  // CV generation and actions hooks
  const {
    isChecking,
    pdfUrl,
    checkExistingCVAndDisplay,
    refreshPdfDisplay
  } = useCVGeneration();
  
  const {
    handleDialogOpenChange,
    isSubmitting,
    isGenerating
  } = useResumeActions(cvName, setCvName, jobDescription, isEditing);

  // Action hooks
  const {
    checkForExistingCV,
    retryCheckForExistingCV: actionRetryCheck
  } = useFormActions(
    cvName, 
    jobDescription, 
    setHasCheckedForExistingCV, 
    setIsCheckingInProgress, 
    setCheckFailed
  );
  
  // Event handler hooks
  const {
    handleGenerateResume,
    handleSaveJobDescription,
    handleCreateClick,
    confirmGenerateCV
  } = useFormHandlers(cvName, jobDescription, isEditing, setCvName);
  
  // Check for existing CV when component mounts
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      console.log(`Checking for existing CV on component mount in background: ${cvName}`);
      checkForExistingCV(cvName);
    }
  }, [cvName, hasCheckedForExistingCV, isCheckingInProgress, checkForExistingCV]);
  
  // Combined retry function
  const doRetryCheckForExistingCV = () => {
    if (cvName) {
      actionRetryCheck(cvName);
      return initRetryCheck(cvName);
    }
    return false;
  };

  return {
    // Data states
    jobDescription,
    setJobDescription,
    cvName,
    setCvName,
    isEditing,
    
    // Dialog states
    cvNameDialogOpen,
    handleDialogOpenChange,
    confirmDialogOpen,
    setConfirmDialogOpen,
    
    // Action states
    isSubmitting,
    isGenerating,
    isChecking,
    
    // CV and PDF states
    pdfUrl,
    hasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    
    // Event handlers
    handleGenerateResume,
    handleCreateNewCV: handleCreateClick,
    handleSaveJobDescription,
    confirmGenerateCV,
    
    // Navigation
    navigate,
    
    // Utility functions
    checkForExistingCV,
    retryCheckForExistingCV: doRetryCheckForExistingCV,
    refreshPdfDisplay
  };
}
