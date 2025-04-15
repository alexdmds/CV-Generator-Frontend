
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from "@/components/auth/firebase-config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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
          // Essayer d'abord de récupérer le CV par son ID document
          const cvDocRef = doc(db, "cvs", id);
          const cvDoc = await getDoc(cvDocRef);
          
          if (cvDoc.exists()) {
            // CV trouvé par ID
            const cvData = cvDoc.data();
            setJobDescription(cvData.job_raw || "");
            setCvName(cvData.cv_name || "");
            console.log("CV data loaded by document ID:", cvData);
          } else {
            // Sinon, essayer avec l'ancienne méthode par cv_name
            const cvsQuery = query(
              collection(db, "cvs"), 
              where("user_id", "==", user.uid),
              where("cv_name", "==", id)
            );
            
            const querySnapshot = await getDocs(cvsQuery);
            
            if (!querySnapshot.empty) {
              const cvData = querySnapshot.docs[0].data();
              setJobDescription(cvData.job_raw || "");
              setCvName(cvData.cv_name || "");
              console.log("CV data loaded by name:", cvData);
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
