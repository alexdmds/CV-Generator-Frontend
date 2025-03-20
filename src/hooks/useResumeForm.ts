
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCVData } from "./useCVData";
import { useCVNameDialog } from "./useCVNameDialog";
import { useCVSubmission } from "./useCVSubmission";

export function useResumeForm() {
  const { 
    jobDescription, 
    setJobDescription, 
    cvName, 
    setCvName, 
    isEditing,
    id
  } = useCVData();
  
  const navigate = useNavigate();
  
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  } = useCVNameDialog(isEditing, cvName);
  
  const {
    isSubmitting,
    handleGenerateResume: submitResume,
    handleCreateNewCV: createNewCV
  } = useCVSubmission();
  
  // Show the name dialog if we're creating a new CV
  useEffect(() => {
    if (id === "new") {
      setCvNameDialogOpen(true);
    }
  }, [id, setCvNameDialogOpen]);
  
  // Wrapper functions to pass the current state values
  const handleGenerateResume = async () => {
    return submitResume(cvName, jobDescription);
  };
  
  const handleCreateNewCV = async () => {
    const success = await createNewCV(cvName, jobDescription);
    if (success) {
      setCvNameDialogOpen(false);
    }
    return success;
  };

  return {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    cvName,
    setCvName,
    isEditing,
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV,
    navigate
  };
}
