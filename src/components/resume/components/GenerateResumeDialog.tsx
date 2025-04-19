
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { useCVCreation } from "@/hooks/useCVCreation";
import { useResumeGeneration } from "@/hooks/useResumeGeneration";
import { useResumes } from "../hooks/useResumes";

interface GenerateResumeDialogProps {
  jobDescriptionDialogOpen: boolean;
  setJobDescriptionDialogOpen: (open: boolean) => void;
  confirmDialogOpen: boolean;
  setConfirmDialogOpen: (open: boolean) => void;
}

export function GenerateResumeDialog({
  jobDescriptionDialogOpen,
  setJobDescriptionDialogOpen,
  confirmDialogOpen,
  setConfirmDialogOpen
}: GenerateResumeDialogProps) {
  const { toast } = useToast();
  const { 
    isSubmitting, 
    pendingCvId, 
    pendingCvName, 
    createCVDocument,
    resetPendingStates
  } = useCVCreation();
  
  const { 
    isSubmitting: isGenerating, 
    handleGenerateResume 
  } = useResumeGeneration();
  
  // Utiliser useResumes pour accéder à la fonction refreshResumes
  const { refreshResumes } = useResumes();

  // Handle job description submission
  const handleJobDescriptionSubmit = async (jobDescription: string) => {
    try {
      const result = await createCVDocument(jobDescription);
      
      if (result.success) {
        setJobDescriptionDialogOpen(false);
        setConfirmDialogOpen(true);
      }
    } catch (error) {
      console.error("Error creating CV document:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du document CV",
        variant: "destructive",
      });
    }
  };

  // Handle confirmation to generate CV
  const handleConfirmGenerate = async () => {
    setConfirmDialogOpen(false);
    try {
      await handleGenerateResume(pendingCvId, pendingCvName);
    } catch (error) {
      console.error("Error generating resume:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
    }
  };

  // Handle dialog cancellation
  const handleDialogCancel = () => {
    console.log("Dialog cancelled, resetting pending states");
    
    // Ne pas essayer de supprimer le document, simplement réinitialiser les états
    resetPendingStates();
    
    // Rafraîchir la liste des CV pour s'assurer que l'interface est à jour
    refreshResumes();
  };

  return (
    <>
      <JobDescriptionDialog 
        open={jobDescriptionDialogOpen}
        onOpenChange={(open) => {
          setJobDescriptionDialogOpen(open);
          if (!open) handleDialogCancel();
        }}
        onConfirm={handleJobDescriptionSubmit}
        isSubmitting={isSubmitting}
      />

      <GenerateConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) handleDialogCancel();
        }}
        onConfirm={handleConfirmGenerate}
        isSubmitting={isSubmitting || isGenerating}
        isGenerating={isGenerating}
        progress={0} // Progress is now handled by events
      />
    </>
  );
}
