
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from "@/components/auth/firebase-config";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { CV } from "@/types/profile";

export const useRenameResume = (
  resumes: CV[],
  setResumes: React.Dispatch<React.SetStateAction<CV[]>>
) => {
  const { toast } = useToast();

  const renameResume = async (oldName: string, newName: string) => {
    if (!newName) return;
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour renommer un CV",
        variant: "destructive",
      });
      return;
    }

    try {
      // Trouver le CV dans la collection "cvs"
      const cvsQuery = query(
        collection(db, "cvs"), 
        where("user_id", "==", user.uid),
        where("cv_name", "==", oldName)
      );
      
      const querySnapshot = await getDocs(cvsQuery);
      
      if (!querySnapshot.empty) {
        // Récupérer les données du CV
        const cvData = querySnapshot.docs[0].data();
        
        // Mettre à jour le nom du CV
        cvData.cv_name = newName;
        
        // Mise à jour du document
        await updateDoc(querySnapshot.docs[0].ref, cvData);
        
        // Mettre à jour l'état local
        setResumes(prev => prev.map(cv => {
          if (cv.cv_name === oldName) {
            return { ...cv, cv_name: newName };
          }
          return cv;
        }));
        
        toast({
          title: "CV renommé",
          description: "Le CV a été renommé avec succès",
        });
      } else {
        console.error("CV not found for renaming:", oldName);
        toast({
          title: "Erreur",
          description: "CV introuvable",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error renaming CV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de renommer le CV",
        variant: "destructive",
      });
    }
  };

  return { renameResume };
};
