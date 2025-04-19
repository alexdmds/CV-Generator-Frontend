
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
      
      // Utiliser directement l'ID du document pour le supprimer
      const docRef = doc(db, "cvs", cvId);
      console.log("Deleting document with ref:", docRef.path);
      
      // Vérifiez si le CV appartient à l'utilisateur actuel avant de le supprimer
      // Cette vérification est effectuée par les règles de sécurité Firestore
      await deleteDoc(docRef);
      console.log("Document successfully deleted");
      
      // Mettre à jour l'état local
      setResumes(prev => prev.filter(resume => (resume as any).id !== cvId));
      
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
      
      return true;
    } catch (error) {
      console.error("Error deleting CV:", error);
      
      // Message d'erreur plus détaillé pour aider au débogage
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : "Erreur inconnue";
      
      toast({
        title: "Erreur de suppression",
        description: `Impossible de supprimer le CV en attente. ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  return { deleteResume };
};
