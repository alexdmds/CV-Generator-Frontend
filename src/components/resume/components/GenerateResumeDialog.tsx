
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { doc, collection, setDoc } from "firebase/firestore";
import { db, auth } from "@/components/auth/firebase-config";
import { useCVGeneration } from "@/hooks/useCVGeneration";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";

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
  const [pendingCvName, setPendingCvName] = useState<string | null>(null);
  const { toast } = useToast();
  const { isGenerating, progress, generateCV } = useCVGeneration();

  // Fonction pour émettre des événements de progression de la génération
  const emitGenerationEvent = (eventName: string, data: any = {}) => {
    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: true 
    });
    window.dispatchEvent(event);
  };

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
      setPendingCvName(defaultCvName);
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
      // Fermer la boîte de dialogue de confirmation
      setConfirmDialogOpen(false);
      
      // Émettre l'événement de début de génération
      emitGenerationEvent('cv-generation-start', { 
        progress: 5, 
        cvId: pendingCvId,
        cvName: pendingCvName
      });
      
      // Configurer un intervalle pour simuler une progression en attendant l'API
      const progressInterval = setInterval(() => {
        // Mettre à jour la progression jusqu'à 90%
        const newProgress = Math.min(progress + Math.random() * 5, 90);
        
        // Émettre l'événement de progression
        emitGenerationEvent('cv-generation-progress', { 
          progress: newProgress,
          cvId: pendingCvId
        });
      }, 2000);
      
      // Appel explicite avec l'ID exact du document
      const success = await generateCV(pendingCvId);
      
      // Nettoyer l'intervalle
      clearInterval(progressInterval);
      
      if (success) {
        // Émettre l'événement de fin de génération
        emitGenerationEvent('cv-generation-complete', { 
          progress: 100,
          cvId: pendingCvId,
          success: true
        });
        
        toast({
          title: "Succès",
          description: "Votre CV a été généré avec succès",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Émettre l'événement d'échec
        emitGenerationEvent('cv-generation-complete', { 
          progress: 100,
          cvId: pendingCvId,
          success: false
        });
        
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du CV",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleConfirmGenerate:", error);
      
      // Émettre l'événement d'échec
      emitGenerationEvent('cv-generation-complete', { 
        progress: 100,
        cvId: pendingCvId,
        success: false,
        error: error
      });
      
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
