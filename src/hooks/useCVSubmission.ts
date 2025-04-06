
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

  // Function to handle creating or updating a CV
  const handleSubmitCV = async (cvName: string, jobDescription: string, shouldNavigate: boolean = true) => {
    const validation = validateCV(cvName, jobDescription);
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
        description: "Vous devez être connecté pour sauvegarder un CV",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    setIsSubmitting(true);
    console.log("Starting CV save process...");

    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved) {
        if (shouldNavigate) {
          // Navigate back to resumes list
          console.log("CV saved successfully, navigating back to resumes list");
          navigate("/resumes");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simplified wrapper for creating a new CV
  const handleCreateNewCV = async (cvName: string, jobDescription: string) => {
    // For new CVs, we'll navigate only if there's a job description already provided
    const shouldNavigate = jobDescription.trim().length > 0;
    return handleSubmitCV(cvName, jobDescription, shouldNavigate);
  };

  // Simplified wrapper for updating an existing CV
  const handleUpdateCV = async (cvName: string, jobDescription: string) => {
    return handleSubmitCV(cvName, jobDescription, true);
  };

  return {
    isSubmitting,
    handleCreateNewCV,
    handleUpdateCV
  };
}
