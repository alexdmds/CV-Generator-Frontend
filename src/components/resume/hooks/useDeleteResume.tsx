
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
      return;
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
        return;
      }
      
      // Utiliser directement l'ID du document pour le supprimer
      const docRef = doc(db, "cvs", cvId);
      console.log("Deleting document with ref:", docRef.path);
      
      await deleteDoc(docRef);
      console.log("Document successfully deleted");
      
      // Mettre à jour l'état local
      setResumes(prev => prev.filter(resume => (resume as any).id !== cvId));
      
      toast({
        title: "CV supprimé",
        description: "Le CV a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le CV",
        variant: "destructive",
      });
    }
  };

  return { deleteResume };
};
