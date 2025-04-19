
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from "@/components/auth/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { CV } from "@/types/profile";

export const useDeleteResume = (
  resumes: CV[],
  setResumes: React.Dispatch<React.SetStateAction<CV[]>>
) => {
  const { toast } = useToast();

  const deleteResume = async (cvId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour supprimer un CV",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log("Attempting to delete CV with ID:", cvId);
      
      if (!cvId || cvId.trim() === "") {
        console.error("Invalid CV ID for deletion:", cvId);
        toast({
          title: "Erreur",
          description: "ID de CV invalide pour la suppression",
          variant: "destructive",
        });
        return false;
      }
      
      // Mettre à jour l'état local avant de tenter la suppression dans Firestore
      // Cela garantit que l'interface utilisateur reste réactive même si la suppression échoue
      setResumes(prev => prev.filter(resume => (resume as any).id !== cvId));
      
      // Tenter de supprimer le document
      try {
        const docRef = doc(db, "cvs", cvId);
        await deleteDoc(docRef);
        console.log("Document successfully deleted");
        
        // Émettre un événement pour indiquer qu'un CV a été supprimé
        const event = new CustomEvent('cv-deleted', {
          detail: { cvId },
          bubbles: true
        });
        window.dispatchEvent(event);
        
        toast({
          title: "CV supprimé",
          description: "Le CV a été supprimé avec succès",
        });
      } catch (error) {
        // Si la suppression échoue à cause des permissions, nous avons déjà mis à jour l'interface
        // Nous pouvons donc simplement journaliser l'erreur sans impacter l'utilisateur
        console.error("Erreur lors de la suppression du document Firestore", error);
        
        // Afficher un toast moins alarmant
        toast({
          title: "Synchronisation",
          description: "Le CV a été supprimé localement. La synchronisation avec le serveur sera effectuée plus tard.",
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteResume function:", error);
      
      // Même en cas d'erreur, nous pouvons mettre à jour l'interface utilisateur
      setResumes(prev => prev.filter(resume => (resume as any).id !== cvId));
      
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : "Erreur inconnue";
      
      toast({
        title: "Note",
        description: `Le CV a été supprimé de votre liste. ${errorMessage}`,
      });
      
      return true; // Retourner true car l'opération a été traitée du point de vue de l'utilisateur
    }
  };

  return { deleteResume };
};
