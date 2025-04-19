
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi } from "@/utils/apiService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { useGenerationProgress } from "./useGenerationProgress";
import { useNavigate } from "react-router-dom";

export function useGenerateCV() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startGenerationProgress, completeGenerationProgress } = useGenerationProgress();

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

      setIsGenerating(true);

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
      
      const progressIntervals = startGenerationProgress(cvId, cvName);

      const result = await generateCVApi(user, cvId);
      
      progressIntervals.forEach(interval => clearInterval(interval));
      
      if (result.success) {
        completeGenerationProgress(cvId, true);
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        setTimeout(() => {
          navigate(`/resumes/${cvId}`);
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
      
      completeGenerationProgress(cvId, false, error);
      return false;
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    }
  };

  return {
    isGenerating,
    generateCV
  };
}
