
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/components/auth/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CV } from "@/types/profile";
import { onAuthStateChanged } from "firebase/auth";

export const useLoadResumes = () => {
  const [resumes, setResumes] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          const cvsQuery = query(collection(db, "cvs"), where("user_id", "==", user.uid));
          const cvsSnapshot = await getDocs(cvsQuery);
          
          console.log("CVs snapshot size:", cvsSnapshot.size);
          
          if (!cvsSnapshot.empty) {
            const cvsData = cvsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
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

  return { resumes, setResumes, isLoading };
};
