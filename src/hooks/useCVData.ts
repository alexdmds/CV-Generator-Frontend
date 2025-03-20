
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from "@/components/auth/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { CV } from "@/types/profile";

export function useCVData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [cvName, setCvName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're editing an existing CV
    const loadCvData = async () => {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder à vos CVs",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      if (id && id !== "new") {
        setIsEditing(true);
        
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const cvs = userData.cvs || [];
            const cv = cvs.find((cv: CV) => cv.cv_name === id);
            
            if (cv) {
              setJobDescription(cv.job_raw || "");
              setCvName(cv.cv_name || "");
            } else {
              toast({
                title: "CV introuvable",
                description: "Le CV demandé n'existe pas",
                variant: "destructive",
              });
              navigate("/resumes");
            }
          }
        } catch (error) {
          console.error("Error loading CV data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du CV",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadCvData();
  }, [id, navigate, toast]);

  return {
    jobDescription,
    setJobDescription,
    cvName,
    setCvName,
    isEditing,
    isLoading,
    id
  };
}
