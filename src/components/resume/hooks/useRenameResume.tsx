
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from "@/components/auth/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { CV } from "@/types/profile";

export const useRenameResume = (
  resumes: CV[],
  setResumes: React.Dispatch<React.SetStateAction<CV[]>>
) => {
  const { toast } = useToast();

  const renameResume = async (cvId: string, newName: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour renommer un CV",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log("Attempting to rename CV with ID:", cvId);
      
      if (!cvId || cvId.trim() === "") {
        console.error("Invalid CV ID for renaming:", cvId);
        toast({
          title: "Erreur",
          description: "ID de CV invalide pour le renommage",
          variant: "destructive",
        });
        return false;
      }
      
      // Utiliser directement l'ID du document pour mettre à jour le nom
      const docRef = doc(db, "cvs", cvId);
      console.log("Updating document with ref:", docRef.path);
      
      await updateDoc(docRef, {
        cv_name: newName
      });
      
      console.log("Document successfully renamed");
      
      // Mettre à jour l'état local
      setResumes(prev => prev.map(resume => {
        if ((resume as any).id === cvId) {
          return {
            ...resume,
            cv_name: newName
          };
        }
        return resume;
      }));
      
      toast({
        title: "CV renommé",
        description: "Le CV a été renommé avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Error renaming CV:", error);
      
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : "Erreur inconnue";
      
      toast({
        title: "Erreur de renommage",
        description: `Impossible de renommer le CV. ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  return { renameResume };
};
