
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { useCVCreation } from "@/hooks/useCVCreation";
import { useResumeGeneration } from "@/hooks/useResumeGeneration";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";

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
    setPendingCvId,
    setPendingCvName
  } = useCVCreation();
  
  const { 
    isSubmitting: isGenerating, 
    handleGenerateResume 
  } = useResumeGeneration();

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
  const handleDialogCancel = async () => {
    console.log("Dialog cancelled");
    
    // Si nous avons un CV en attente de génération et que l'utilisateur annule, nous le supprimons
    if (pendingCvId) {
      try {
        console.log(`Suppression du CV annulé avec ID: ${pendingCvId}`);
        
        // Supprimer le document de Firestore
        const docRef = doc(db, "cvs", pendingCvId);
        await deleteDoc(docRef);
        
        toast({
          title: "CV supprimé",
          description: "Le CV en attente a été supprimé suite à l'annulation",
        });
        
        // Réinitialiser les états pour éviter des références obsolètes
        setPendingCvId(null);
        setPendingCvName(null);
      } catch (error) {
        console.error("Erreur lors de la suppression du CV annulé:", error);
        
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer le CV en attente",
        });
      }
    }
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
