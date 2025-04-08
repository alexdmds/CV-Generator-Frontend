
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCVData } from "./useCVData";
import { useCVNameDialog } from "./useCVNameDialog";
import { useCVSubmission } from "./useCVSubmission";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { saveCVToFirestore } from "@/utils/cvUtils";
import { useCVGeneration } from "./useCVGeneration";
import { useConfirmDialog } from "./useConfirmDialog";

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
  const { toast } = useToast();
  const [hasCheckedForExistingCV, setHasCheckedForExistingCV] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  
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

  // Using our hooks
  const confirmDialog = useConfirmDialog();
  const { 
    isGenerating, 
    isChecking,
    pdfUrl, 
    generateCV,
    checkExistingCVAndDisplay,
    checkFailed: generationCheckFailed
  } = useCVGeneration();
  
  // Get initial CV name from URL if present
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setCvName(decodeURIComponent(nameFromUrl));
    }
  }, [searchParams, setCvName]);
  
  // Check if a CV already exists with the given name
  const checkForExistingCV = useCallback(async (name: string) => {
    if (!name || hasCheckedForExistingCV || isCheckingInProgress) {
      return;
    }
    
    setIsCheckingInProgress(true);
    
    try {
      console.log(`Starting CV check for: ${name}`);
      const checkResult = await checkExistingCVAndDisplay(name, false);
      console.log(`CV check result: ${checkResult}`);
      
      setHasCheckedForExistingCV(true);
      setCheckFailed(!checkResult);
    } catch (error) {
      console.error("Error in checkForExistingCV:", error);
      setCheckFailed(true);
    } finally {
      setIsCheckingInProgress(false);
    }
  }, [checkExistingCVAndDisplay, hasCheckedForExistingCV, isCheckingInProgress]);
  
  // Function to retry checking if the first attempt failed
  const retryCheckForExistingCV = useCallback(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
      setCheckFailed(false);
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV]);
  
  // Vérifier l'existence du CV lorsque le nom change
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV, hasCheckedForExistingCV, isCheckingInProgress]);
  
  // Réinitialiser le drapeau de vérification lorsque le nom du CV change
  useEffect(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
    }
  }, [cvName]);
  
  // Fonction pour ouvrir le dialogue de confirmation
  const openConfirmDialog = async () => {
    // Sauvegarder d'abord la fiche de poste sans afficher de toast
    const saved = await handleSaveJobDescription(false);
    if (saved) {
      confirmDialog.openDialog();
    }
  };
  
  // Fonction pour générer le CV après confirmation
  const confirmGenerateCV = async () => {
    confirmDialog.closeDialog();
    await generateCV(cvName);
  };

  // Wrapper functions to pass the current state values
  const handleGenerateResume = async () => {
    openConfirmDialog();
  };
  
  // Wrapper for creating new CV with current state values
  const handleCreateNewCVWithState = async () => {
    const success = await handleCreateNewCV(cvName, jobDescription);
    if (success) {
      setCvNameDialogOpen(false);
    }
    return success;
  };

  // Fonction pour sauvegarder la fiche de poste sans générer le CV
  const handleSaveJobDescription = async (showToast = true) => {
    if (!cvName) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord nommer votre CV",
        variant: "destructive",
      });
      handleDialogOpenChange(true);
      return false;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour sauvegarder la fiche de poste",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved && showToast) {
        toast({
          title: "Sauvegardé",
          description: "La fiche de poste a été sauvegardée avec succès",
        });
      }
      return saved;
    } catch (error) {
      console.error("Error saving job description:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
      return false;
    }
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
    handleCreateNewCV: handleCreateNewCVWithState,
    handleSaveJobDescription,
    navigate,
    confirmDialogOpen: confirmDialog.isOpen,
    setConfirmDialogOpen: confirmDialog.setIsOpen,
    confirmGenerateCV,
    isGenerating,
    isChecking,
    pdfUrl,
    checkForExistingCV,
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV
  };
}
