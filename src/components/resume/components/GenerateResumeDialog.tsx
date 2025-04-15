
import { useState } from "react";
import { GenerateConfirmDialog } from "./GenerateConfirmDialog";
import { JobDescriptionDialog } from "./JobDescriptionDialog";
import { useToast } from "@/components/ui/use-toast";
import { doc, collection, setDoc } from "firebase/firestore";
import { db, auth } from "@/components/auth/firebase-config";
import { useCVGeneration } from "@/hooks/useCVGeneration";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Fonction pour émettre des événements de progression de la génération
  const emitGenerationEvent = (eventName: string, data: any = {}) => {
    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: true 
    });
    window.dispatchEvent(event);
  };

  // Générer une progression plus cohérente
  const generateSmoothProgress = (initialProgress: number, targetProgress: number, duration: number, updateInterval: number) => {
    const steps = Math.floor(duration / updateInterval);
    const increment = (targetProgress - initialProgress) / steps;
    let currentStep = 0;
    let currentProgress = initialProgress;
    
    const interval = setInterval(() => {
      currentStep++;
      currentProgress += increment;
      
      // Ajouter une légère variation aléatoire pour paraître naturel
      const randomFactor = 0.2; // 20% de variation maximale
      const variation = increment * randomFactor * (Math.random() - 0.5);
      
      currentProgress = Math.min(Math.max(currentProgress + variation, initialProgress), targetProgress);
      
      // Émettre l'événement de progression
      emitGenerationEvent('cv-generation-progress', { 
        progress: currentProgress,
        cvId: pendingCvId
      });
      
      // Arrêter l'intervalle une fois la progression cible atteinte
      if (currentStep >= steps || currentProgress >= targetProgress) {
        clearInterval(interval);
      }
    }, updateInterval);
    
    return interval;
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
      
      // Progression par étapes avec intervalles de temps réalistes
      const initialProgress = 5;
      
      // Intervalles de progression par étapes
      let progressIntervals: NodeJS.Timeout[] = [];
      
      // Étape 1: 5% -> 30% (analyse du poste)
      progressIntervals.push(generateSmoothProgress(initialProgress, 30, 5000, 200));
      
      // Étape 2: 30% -> 50% (adaptation du profil)
      setTimeout(() => {
        progressIntervals.push(generateSmoothProgress(30, 50, 8000, 200));
      }, 5000);
      
      // Étape 3: 50% -> 70% (mise en forme)
      setTimeout(() => {
        progressIntervals.push(generateSmoothProgress(50, 70, 8000, 200));
      }, 13000);
      
      // Étape 4: 70% -> 85% (finalisation)
      setTimeout(() => {
        progressIntervals.push(generateSmoothProgress(70, 85, 6000, 200));
      }, 21000);
      
      // Appel explicite avec l'ID exact du document
      const success = await generateCV(pendingCvId);
      
      // Nettoyer tous les intervalles
      progressIntervals.forEach(interval => clearInterval(interval));
      
      if (success) {
        // Progression finale
        emitGenerationEvent('cv-generation-progress', { 
          progress: 95,
          cvId: pendingCvId
        });
        
        setTimeout(() => {
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
          
          // Rediriger vers la page d'aperçu du CV
          setTimeout(() => {
            navigate(`/resumes/${pendingCvId}`);
          }, 1000);
        }, 1000);
      } else {
        // Nettoyer tous les intervalles
        progressIntervals.forEach(interval => clearInterval(interval));
        
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
