
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from "@/components/auth/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { CV } from "@/types/profile";
import { saveCVToFirestore } from "@/utils/cvUtils";
import { validateCV } from "@/utils/cvValidation";

export function useResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [cvNameDialogOpen, setCvNameDialogOpen] = useState(false);
  const [cvName, setCvName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        }
      } else if (id === "new") {
        // For new CV, show the name dialog
        setCvNameDialogOpen(true);
      }
    };
    
    loadCvData();
  }, [id, navigate, toast]);

  // Handle when user tries to close the CV name dialog
  const handleDialogOpenChange = (open: boolean) => {
    // Only allow closing the dialog if we're editing an existing CV
    // or a name has been provided for a new CV
    if (isEditing || (cvName.trim() !== "" && !open)) {
      setCvNameDialogOpen(open);
    } else if (!open && id === "new") {
      // If trying to close without a name during new CV creation, navigate back
      navigate("/resumes");
    } else {
      setCvNameDialogOpen(open);
    }
  };

  const handleGenerateResume = async () => {
    const validation = validateCV(cvName, jobDescription);
    if (!validation.valid) {
      toast({
        title: "Erreur",
        description: validation.message || "Veuillez vérifier les informations saisies",
        variant: "destructive",
      });
      
      if (!cvName.trim()) {
        setCvNameDialogOpen(true);
      }
      
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez copier la fiche de poste avant de générer un CV",
        variant: "destructive",
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour générer un CV",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    console.log("Starting CV generation and save process...");

    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved) {
        // Navigate back to resumes list
        console.log("CV saved successfully, navigating back to resumes list");
        navigate("/resumes");
      }
    } catch (error) {
      console.error("Error in handleGenerateResume:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateNewCV = async () => {
    const validation = validateCV(cvName);
    if (!validation.valid) {
      toast({
        title: "Erreur",
        description: validation.message || "Veuillez vérifier les informations saisies",
        variant: "destructive",
      });
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un CV",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setCvNameDialogOpen(false);
    setIsSubmitting(true);
    console.log("Creating new CV in Firestore...");
    
    try {
      const saved = await saveCVToFirestore({
        user,
        cvName,
        jobDescription,
        toast
      });
      
      if (saved && !jobDescription.trim()) {
        // If no job description yet, stay on the page to let user fill it
        setIsSubmitting(false);
      } else if (saved) {
        // Navigate back to resumes list if we have both name and job description
        console.log("CV creation complete, navigating to resumes list");
        navigate("/resumes");
      }
    } catch (error) {
      console.error("Error creating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du CV",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange,
    cvName,
    setCvName,
    isEditing,
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV,
    navigate
  };
}
