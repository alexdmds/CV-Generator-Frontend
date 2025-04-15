
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from "@/components/auth/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { CV } from "@/types/profile";

export const useDeleteResume = (
  resumes: CV[],
  setResumes: React.Dispatch<React.SetStateAction<CV[]>>
) => {
  const { toast } = useToast();

  const deleteResume = async (cvName: string) => {
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
      // Trouver le CV dans l'état local
      const cvToDelete = resumes.find(cv => cv.cv_name === cvName);
      
      if (!cvToDelete || !(cvToDelete as any).id) {
        console.error("CV not found or missing ID:", cvName);
        toast({
          title: "Erreur",
          description: "CV introuvable",
          variant: "destructive",
        });
        return;
      }
      
      // Supprimer le document directement en utilisant son ID
      await deleteDoc(doc(db, "cvs", (cvToDelete as any).id));
      
      // Mettre à jour l'état local
      setResumes(prev => prev.filter(cv => cv.cv_name !== cvName));
      
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
