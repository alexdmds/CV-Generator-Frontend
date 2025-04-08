
import { useCallback } from "react";
import { useCVSaving } from "./useCVSaving";
import { useConfirmDialog } from "./useConfirmDialog";
import { useCVGeneration } from "./useCVGeneration";

interface UseCVGenDialogProps {
  cvName: string;
  jobDescription: string;
}

export function useCVGenDialog({ cvName, jobDescription }: UseCVGenDialogProps) {
  const confirmDialog = useConfirmDialog();
  const { handleSaveJobDescription } = useCVSaving();
  const { generateCV } = useCVGeneration();
  
  // Fonction pour ouvrir le dialogue de confirmation
  const openConfirmDialog = useCallback(async () => {
    // Sauvegarder d'abord la fiche de poste sans afficher de toast
    const saved = await handleSaveJobDescription({ 
      cvName, 
      jobDescription, 
      showToast: false 
    });
    
    if (saved) {
      confirmDialog.openDialog();
    }
  }, [confirmDialog, handleSaveJobDescription, cvName, jobDescription]);
  
  // Fonction pour générer le CV après confirmation
  const confirmGenerateCV = useCallback(async () => {
    confirmDialog.closeDialog();
    await generateCV(cvName);
  }, [confirmDialog, generateCV, cvName]);

  return {
    confirmDialogOpen: confirmDialog.isOpen,
    setConfirmDialogOpen: confirmDialog.setIsOpen,
    handleGenerateResume: openConfirmDialog,
    confirmGenerateCV
  };
}
