
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { createCVFromProfile } from "@/utils/cvFactory";

export function useCVSubmission() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle creating or updating a CV
  const handleSubmitCV = async (cvName: string, jobDescription: string, shouldNavigate: boolean = true) => {
    if (!jobDescription.trim()) {
      toast({
        title: "Erreur",
        description: "La fiche de poste est obligatoire",
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
      // Générer un ID unique pour le document
      const cvDocRef = doc(collection(db, "cvs"));
      const uniqueId = cvDocRef.id;
      
      // Récupérer le profil utilisateur
      const profileDocRef = doc(db, "profiles", user.uid);
      const userProfile = await profileDocRef.get();
      
      if (!userProfile.exists()) {
        toast({
          title: "Profil manquant",
          description: "Vous devez d'abord créer votre profil",
          variant: "destructive",
        });
        navigate("/profile");
        return false;
      }
      
      // Générer un nom de CV par défaut si non fourni
      const actualCvName = cvName || `CV - ${new Date().toLocaleDateString()}`;
      
      // Créer l'objet CV
      const profileData = userProfile.data();
      const newCV = createCVFromProfile(profileData, jobDescription, actualCvName);
      
      // Sauvegarder le document avec son ID unique
      await setDoc(cvDocRef, {
        user_id: user.uid,
        cv_id: uniqueId,
        cv_name: actualCvName,
        job_raw: jobDescription,
        job_sumup: "", // À remplir plus tard
        cv_data: newCV.cv_data
      });
      
      toast({
        title: "Succès !",
        description: "Votre CV a été sauvegardé avec succès.",
      });
      
      if (shouldNavigate) {
        console.log("CV saved successfully, navigating to edit page");
        navigate(`/resumes/${uniqueId}`);
      }
      
      return true;
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
    return handleSubmitCV(cvName, jobDescription, true);
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
