
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { doc, collection, setDoc } from "firebase/firestore";
import { db, auth } from "@/components/auth/firebase-config";
import { useCVGeneration } from "@/hooks/useCVGeneration";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingJobDescription, setPendingJobDescription] = useState("");
  const [pendingCvId, setPendingCvId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isGenerating, progress, generateCV } = useCVGeneration();

  const handleJobDescriptionSubmit = async (jobDescription: string) => {
    setIsSubmitting(true);
    setPendingJobDescription(jobDescription);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un CV",
          variant: "destructive",
        });
        return;
      }
      
      const cvDocRef = doc(collection(db, "cvs"));
      const cvId = cvDocRef.id;
      
      console.log("Creating new CV document with ID:", cvId);
      
      const defaultCvName = `CV - ${new Date().toLocaleDateString()}`;
      
      await setDoc(cvDocRef, {
        user_id: user.uid,
        cv_id: cvId,
        cv_name: defaultCvName,
        job_raw: jobDescription,
        job_sumup: "",
        creation_date: new Date().toISOString()
      });
      
      console.log("Document CV créé avec succès:", cvId);
      
      setJobDescriptionDialogOpen(false);
      setPendingCvId(cvId);
      setConfirmDialogOpen(true);
      
    } catch (error) {
      console.error("Error creating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du CV",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmGenerate = async () => {
    if (!pendingCvId) {
      console.error("No pending CV ID for generation");
      toast({
        title: "Erreur",
        description: "Impossible de générer le CV sans identifiant",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Confirming generation for CV ID:", pendingCvId);
    
    try {
      // Appel explicite avec l'ID exact du document
      const success = await generateCV(pendingCvId);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Votre CV a été généré avec succès",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error in handleConfirmGenerate:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
    }
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
        isSubmitting={isSubmitting}
        isGenerating={isGenerating}
        progress={progress}
      />
    </>
  );
}
