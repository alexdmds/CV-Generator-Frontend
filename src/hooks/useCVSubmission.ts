
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { saveCVToFirestore } from "@/utils/cvUtils";
import { validateCV } from "@/utils/cvValidation";

export function useCVSubmission() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateResume = async (cvName: string, jobDescription: string) => {
    const validation = validateCV(cvName, jobDescription);
    if (!validation.valid) {
      toast({
        title: "Erreur",
        description: validation.message || "Veuillez vérifier les informations saisies",
        variant: "destructive",
      });
      
      return false;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez copier la fiche de poste avant de générer un CV",
        variant: "destructive",
      });
      return false;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour générer un CV",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    setIsSubmitting(true);
    console.log("Starting CV generation and save process...");

    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved) {
        // Navigate back to resumes list
        console.log("CV saved successfully, navigating back to resumes list");
        navigate("/resumes");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleGenerateResume:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateNewCV = async (cvName: string, jobDescription: string) => {
    const validation = validateCV(cvName);
    if (!validation.valid) {
      toast({
        title: "Erreur",
        description: validation.message || "Veuillez vérifier les informations saisies",
        variant: "destructive",
      });
      return false;
    }
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un CV",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }
    
    setIsSubmitting(true);
    console.log("Creating new CV in Firestore...");
    
    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved && !jobDescription.trim()) {
        // If no job description yet, stay on the page to let user fill it
        setIsSubmitting(false);
        return true;
      } else if (saved) {
        // Navigate back to resumes list if we have both name and job description
        console.log("CV creation complete, navigating to resumes list");
        navigate("/resumes");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV
  };
}
