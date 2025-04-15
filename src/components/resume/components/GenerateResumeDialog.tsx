
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { useCVCreation } from "@/hooks/useCVCreation";
import { useResumeGeneration } from "@/hooks/useResumeGeneration";

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
    createCVDocument 
  } = useCVCreation();
  
  const { 
    isSubmitting: isGenerating, 
    handleGenerateResume 
  } = useResumeGeneration();

  // Handle job description submission
  const handleJobDescriptionSubmit = async (jobDescription: string) => {
    const result = await createCVDocument(jobDescription);
    
    if (result.success) {
      setJobDescriptionDialogOpen(false);
      setConfirmDialogOpen(true);
    }
  };

  // Handle confirmation to generate CV
  const handleConfirmGenerate = async () => {
    setConfirmDialogOpen(false);
    await handleGenerateResume(pendingCvId, pendingCvName);
  };

  return (
    <>
      <JobDescriptionDialog 
        open={jobDescriptionDialogOpen}
        onOpenChange={setJobDescriptionDialogOpen}
        onConfirm={handleJobDescriptionSubmit}
        isSubmitting={isSubmitting}
      />

      <GenerateConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmGenerate}
        isSubmitting={isSubmitting || isGenerating}
        isGenerating={isGenerating}
        progress={0} // Progress is now handled by events
      />
    </>
  );
}
