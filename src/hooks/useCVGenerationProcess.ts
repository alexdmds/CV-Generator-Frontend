
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi } from "@/utils/apiService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { useNavigate } from "react-router-dom";

export function useCVGenerationProcess(refreshPdfDisplay: (userId: string, cvName: string) => string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Messages de génération pour chaque étape
  const generationSteps = [
    { progress: 10, message: "Analyse de la fiche de poste..." },
    { progress: 30, message: "Extraction des compétences clés..." },
    { progress: 45, message: "Adaptation de votre profil au poste..." },
    { progress: 60, message: "Mise en forme des expériences professionnelles..." },
    { progress: 75, message: "Optimisation des mots-clés..." },
    { progress: 85, message: "Finalisation du document..." },
    { progress: 95, message: "Publication du CV..." },
  ];

  // Fonction pour simuler une progression cohérente
  const simulateProgressSteps = (cvId: string, cvName: string | undefined) => {
    let currentStep = 0;
    
    // Émettre l'événement initial
    emitGenerationEvent('cv-generation-start', { 
      progress: generationSteps[0].progress, 
      cvId: cvId,
      cvName: cvName
    });
    
    setProgress(generationSteps[0].progress);
    
    // Fonction pour passer à l'étape suivante
    const moveToNextStep = () => {
      currentStep++;
      
      // Si on a atteint la fin des étapes, on s'arrête
      if (currentStep >= generationSteps.length) return;
      
      // Sinon, on émet l'événement pour l'étape suivante
      const currentProgress = generationSteps[currentStep].progress;
      
      emitGenerationEvent('cv-generation-progress', { 
        progress: currentProgress,
        cvId: cvId,
        message: generationSteps[currentStep].message
      });
      
      setProgress(currentProgress);
      
      // Prévoir l'étape suivante après un délai aléatoire
      const nextStepDelay = 3000 + Math.random() * 5000; // Entre 3 et 8 secondes
      setTimeout(moveToNextStep, nextStepDelay);
    };
    
    // Commencer la progression après un court délai
    setTimeout(moveToNextStep, 2000);
  };

  // Fonction pour émettre des événements de progression
  const emitGenerationEvent = (eventName: string, data: any = {}) => {
    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: true 
    });
    window.dispatchEvent(event);
  };

  // Generate a CV
  const generateCV = async (cvId: string) => {
    console.log(`generateCV function called with cvId: "${cvId}"`);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        return false;
      }

      if (!cvId || cvId.trim() === "") {
        console.error("CV ID is missing or empty:", cvId);
        toast({
          title: "Erreur",
          description: "Identifiant du CV manquant ou invalide",
          variant: "destructive",
        });
        return false;
      }

      console.log(`Attempting to generate CV with ID: "${cvId}"`);

      // Mark generation as started
      setIsGenerating(true);
      setProgress(5);

      // Récupérer le document pour obtenir le nom de CV
      const cvDocRef = doc(db, "cvs", cvId);
      const cvDoc = await getDoc(cvDocRef);
      
      if (!cvDoc.exists()) {
        console.error("CV document not found for ID:", cvId);
        toast({
          title: "Erreur",
          description: "Document CV introuvable",
          variant: "destructive",
        });
        return false;
      }
      
      const cvData = cvDoc.data();
      const cvName = cvData.cv_name;
      
      console.log("CV document found, calling generation API for ID:", cvId);
      console.log("Document data:", cvData);
      
      // Démarrer la simulation de progression
      simulateProgressSteps(cvId, cvName);

      // Call generation API with the document ID
      const result = await generateCVApi(user, cvId);
      
      if (result.success) {
        // Refresh display with timestamp to force cache refresh
        if (cvName) {
          refreshPdfDisplay(user.uid, cvName);
        }
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        // Finaliser le processus de génération
        emitGenerationEvent('cv-generation-progress', { 
          progress: 100,
          cvId: cvId
        });
        
        setTimeout(() => {
          emitGenerationEvent('cv-generation-complete', { 
            progress: 100,
            cvId: cvId,
            success: true
          });
          
          // Rediriger vers la page du CV
          setTimeout(() => {
            navigate(`/resumes/${cvId}`);
          }, 1000);
        }, 1000);
        
        return true;
      } else {
        throw new Error(result.message || "Échec de la génération du CV");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      
      // Émettre un événement d'échec
      emitGenerationEvent('cv-generation-complete', { 
        progress: 100,
        cvId: cvId,
        success: false,
        error: error
      });
      
      return false;
    } finally {
      // Reset generation state after a delay to allow user to see completion
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1500);
    }
  };

  return {
    isGenerating,
    progress,
    generateCV
  };
}
