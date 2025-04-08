
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { saveCVToFirestore } from "@/utils/cvUtils";

interface SaveJobDescriptionProps {
  cvName: string;
  jobDescription: string;
  showToast?: boolean;
}

export function useCVSaving() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fonction pour sauvegarder la fiche de poste sans générer le CV
  const handleSaveJobDescription = async ({ 
    cvName, 
    jobDescription, 
    showToast = true 
  }: SaveJobDescriptionProps): Promise<boolean> => {
    if (!cvName) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord nommer votre CV",
        variant: "destructive",
      });
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
      
      if (saved && showToast) {
        toast({
          title: "Sauvegardé",
          description: "La fiche de poste a été sauvegardée avec succès",
        });
      }
      return saved;
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
    handleSaveJobDescription
  };
}
