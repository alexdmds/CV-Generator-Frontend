import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/components/auth/firebase-config";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CV } from "@/types/profile";

export const useResumes = () => {
  const [resumes, setResumes] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load resumes effect
  useEffect(() => {
    const loadResumes = async (user: any) => {
      try {
        if (!user) {
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour voir vos CVs",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        console.log("Loading CVs for user:", user.uid);
        
        try {
          // Récupération des CVs depuis la collection "cvs" en filtrant par user_id
          const cvsQuery = query(collection(db, "cvs"), where("user_id", "==", user.uid));
          const cvsSnapshot = await getDocs(cvsQuery);
          
          console.log("CVs snapshot size:", cvsSnapshot.size);
          
          if (!cvsSnapshot.empty) {
            const cvsData = cvsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id, // Stocke l'ID du document pour la suppression
                cv_name: data.cv_name,
                job_raw: data.job_raw,
                cv_data: data.cv_data
              } as CV & { id: string };
            });
            
            console.log("CVs found:", cvsData);
            setResumes(cvsData);
          } else {
            console.log("No CVs found for user");
            setResumes([]);
          }
        } catch (error) {
          console.error("Error loading CVs:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger vos CVs",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in loadResumes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos CVs",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed. User:", user?.uid);
      if (user) {
        loadResumes(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [toast, navigate]);

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

  return {
    resumes,
    isLoading,
    deleteResume,
    renameResume
  };
};
