
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCVData } from "./useCVData";
import { useCVNameDialog } from "./useCVNameDialog";
import { useCVSubmission } from "./useCVSubmission";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { saveCVToFirestore } from "@/utils/cvUtils";

export function useResumeForm() {
  const { 
    jobDescription, 
    setJobDescription, 
    cvName, 
    setCvName, 
    isEditing,
    id
  } = useCVData();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  } = useCVNameDialog(isEditing, cvName);
  
  const {
    isSubmitting,
    handleGenerateResume: submitResume,
    handleCreateNewCV: createNewCV
  } = useCVSubmission();

  // État pour le dialogue de confirmation de génération
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Get initial CV name from URL if present
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setCvName(decodeURIComponent(nameFromUrl));
    }
  }, [searchParams, setCvName]);
  
  // Show the name dialog if we're creating a new CV and don't have a name
  useEffect(() => {
    if (id === "new" && !cvName) {
      navigate('/resumes');
    }
  }, [id, cvName, navigate]);
  
  // Fonction pour ouvrir le dialogue de confirmation
  const openConfirmDialog = async () => {
    // Sauvegarder d'abord la fiche de poste
    const saved = await handleSaveJobDescription();
    if (saved) {
      setConfirmDialogOpen(true);
    }
  };
  
  // Fonction pour générer le CV après confirmation
  const confirmGenerateCV = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Obtenir le jeton Firebase actuel
      const token = await user.getIdToken(true);
      
      // Appel à l'API de génération avec le token Firebase
      const response = await fetch("https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/generate-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ cv_name: cvName }),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      console.log("CV generation successful:", data);
      toast({
        title: "Succès !",
        description: "Votre CV a été généré avec succès.",
      });
      
      // Naviguer vers la liste des CV
      navigate("/resumes");
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  // Wrapper functions to pass the current state values
  const handleGenerateResume = async () => {
    openConfirmDialog();
  };
  
  const handleCreateNewCV = async () => {
    const success = await createNewCV(cvName, jobDescription);
    if (success) {
      setCvNameDialogOpen(false);
    }
    return success;
  };

  // Fonction pour sauvegarder la fiche de poste sans générer le CV
  const handleSaveJobDescription = async () => {
    if (!cvName) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord nommer votre CV",
        variant: "destructive",
      });
      handleDialogOpenChange(true);
      return false;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour sauvegarder la fiche de poste",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }

    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved) {
        toast({
          title: "Sauvegardé",
          description: "La fiche de poste a été sauvegardée avec succès",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving job description:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    cvName,
    setCvName,
    isEditing,
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV,
    handleSaveJobDescription,
    navigate,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmGenerateCV
  };
}
