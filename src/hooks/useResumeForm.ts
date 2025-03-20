
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  
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
  
  // Get initial CV name from URL if present
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setCvName(decodeURIComponent(nameFromUrl));
    }
  }, [searchParams, setCvName]);
  
  // Show the name dialog if we're creating a new CV and don't have a name
  useEffect(() => {
    if (id === "new" && !cvName) {
      navigate('/resumes');
    }
  }, [id, cvName, navigate]);
  
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
