import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi } from "@/utils/apiService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";

export function useCVGenerationProcess(refreshPdfDisplay: (userId: string, cvName: string) => string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
      setProgress(15);

      // Simulation de progression pendant l'appel API
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Increment progress gradually, but keep it below 95% until complete
          const newProgress = prev + Math.random() * 2;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 2000);

      // Call generation API with the document ID
      const result = await generateCVApi(user, cvId);
      
      // Clear interval and set progress to completion
      clearInterval(progressInterval);
      setProgress(95);

      if (result.success) {
        // Refresh display with timestamp to force cache refresh
        if (cvName) {
          refreshPdfDisplay(user.uid, cvName);
        }
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        setProgress(100);
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
