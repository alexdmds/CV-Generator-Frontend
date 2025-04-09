
import { useState, useEffect } from "react";
import { useCVData } from "./useCVData";
import { useCVInitialization } from "./useCVInitialization";
import { useResumeActions } from "./useResumeActions";
import { useCVGeneration } from "./useCVGeneration";

export function useResumeForm() {
  const { 
    jobDescription, 
    setJobDescription, 
    cvName, 
    setCvName, 
    isEditing,
    id
  } = useCVData();
  
  const {
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    setIsCheckingInProgress,
    checkFailed,
    setCheckFailed,
    retryCheckForExistingCV,
    navigate
  } = useCVInitialization();
  
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    isSubmitting,
    isGenerating,
    openConfirmDialog,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmGenerateCV,
    handleCreateNewCV,
    handleSaveJobDescriptionWithState
  } = useResumeActions(cvName, setCvName, jobDescription, isEditing);

  const {
    isChecking,
    pdfUrl,
    checkExistingCVAndDisplay,
    refreshPdfDisplay
  } = useCVGeneration();
  
  // Check for existing CV when component mounts
  const checkForExistingCV = async (name: string) => {
    if (!name || hasCheckedForExistingCV || isCheckingInProgress) {
      return;
    }
    
    setIsCheckingInProgress(true);
    
    try {
      console.log(`Starting non-blocking CV check for: ${name}`);
      
      // Set immediate candidate URL for PDF
      const checkResult = await checkExistingCVAndDisplay(name, false);
      setCheckFailed(!checkResult);
      
    } catch (error) {
      console.error("Error in non-blocking checkForExistingCV:", error);
      setCheckFailed(true);
    } finally {
      setHasCheckedForExistingCV(true);
      setIsCheckingInProgress(false);
    }
  };
  
  // Non-blocking verification of existing CV
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      console.log(`Checking for existing CV on component mount in background: ${cvName}`);
      checkForExistingCV(cvName);
    }
  }, [cvName, hasCheckedForExistingCV, isCheckingInProgress]);
  
  // Wrapper functions for convenience
  const handleGenerateResume = () => openConfirmDialog();
  const handleSaveJobDescription = () => handleSaveJobDescriptionWithState(true);
  const doRetryCheckForExistingCV = () => {
    if (cvName) {
      return retryCheckForExistingCV(cvName);
    }
    return false;
  };

  return {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    handleDialogOpenChange,
    cvName,
    setCvName,
    isEditing,
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV,
    handleSaveJobDescription,
    navigate,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmGenerateCV,
    isGenerating,
    isChecking,
    pdfUrl,
    checkForExistingCV,
    hasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV: doRetryCheckForExistingCV,
    refreshPdfDisplay
  };
}
