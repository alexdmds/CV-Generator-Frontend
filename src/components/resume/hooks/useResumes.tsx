
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/components/auth/firebase-config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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
        const userDocRef = doc(db, "users", user.uid);
        console.log("User document reference:", userDocRef.path);
        
        try {
          const userDoc = await getDoc(userDocRef);
          console.log("User document exists:", userDoc.exists());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User document data:", userData);
            const cvs = userData.cvs || [];
            console.log("CVs found:", cvs);
            setResumes(cvs);
          } else {
            console.log("No user document found, creating empty document");
            // Create user document if it doesn't exist
            await setDoc(userDocRef, { cvs: [], profile: {} });
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
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cvs = userData.cvs || [];
        
        // Filter out the CV to delete
        const updatedCvs = cvs.filter((cv: CV) => cv.cv_name !== cvName);
        console.log("Deleting CV. Updated CVs:", updatedCvs);
        
        // Update the user document with the updated CVs array
        await updateDoc(userDocRef, { cvs: updatedCvs });
        
        setResumes(updatedCvs);
        toast({
          title: "CV supprimé",
          description: "Le CV a été supprimé avec succès",
        });
      }
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
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cvs = userData.cvs || [];
        
        // Update the CV name
        const updatedCvs = cvs.map((cv: CV) => {
          if (cv.cv_name === oldName) {
            return { ...cv, cv_name: newName };
          }
          return cv;
        });
        
        console.log("Renaming CV. Updated CVs:", updatedCvs);
        
        // Update the user document with the updated CVs array
        await updateDoc(userDocRef, { cvs: updatedCvs });
        
        setResumes(updatedCvs);
        toast({
          title: "CV renommé",
          description: "Le CV a été renommé avec succès",
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
