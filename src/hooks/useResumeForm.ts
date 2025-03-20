
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from "@/components/auth/firebase-config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { CV, Profile } from "@/types/profile";

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
    if (!jobDescription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez copier la fiche de poste avant de générer un CV",
        variant: "destructive",
      });
      return;
    }

    if (!cvName.trim()) {
      setCvNameDialogOpen(true);
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
    console.log("Saving CV to Firestore...");

    try {
      // Get user document reference
      const userDocRef = doc(db, "users", user.uid);
      console.log("User doc reference:", userDocRef.path);
      
      // Get user profile for CV generation if exists
      const userDoc = await getDoc(userDocRef);
      
      let userProfile: Partial<Profile> = {};
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User document data:", userData);
        if (userData.profile) {
          userProfile = userData.profile;
          console.log("User profile retrieved:", userProfile);
        } else {
          console.log("No user profile found, using empty profile");
        }
      } else {
        console.log("User document does not exist, will create a new one");
      }
      
      // Create a new CV object with required structure
      const newCV: CV = {
        job_raw: jobDescription,
        cv_name: cvName,
        cv_data: {
          educations: [],
          lang_of_cv: "français",
          hobbies: userProfile.hobbies || "",
          languages: [],
          phone: userProfile.head?.phone || "",
          mail: userProfile.head?.mail || "",
          title: userProfile.head?.title || "",
          sections_name: {
            experience_section_name: "Expérience professionnelle",
            Hobbies_section: "Centres d'intérêt",
            languages_section_name: "Langues",
            skills_section_name: "Compétences",
            education_section_name: "Formation"
          },
          skills: [],
          experiences: [],
          name: userProfile.head?.name || ""
        }
      };
      
      console.log("New CV object created:", newCV);
      
      // Save to Firestore
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingCvs = userData.cvs || [];
        
        let updatedCvs;
        if (isEditing) {
          console.log("Updating existing CV:", cvName);
          // Replace the CV with the same name
          updatedCvs = existingCvs.map((cv: CV) => 
            cv.cv_name === cvName ? newCV : cv
          );
        } else {
          console.log("Adding new CV:", cvName);
          // Add new CV
          updatedCvs = [...existingCvs, newCV];
        }
        
        console.log("Updating user document with new CVs array:", updatedCvs);
        // Update the document with the new CV
        await updateDoc(userDocRef, { cvs: updatedCvs });
        console.log("Document updated successfully");
      } else {
        console.log("Creating new user document with CV");
        // Create new user document with the CV
        await setDoc(userDocRef, {
          cvs: [newCV],
          profile: userProfile
        });
        console.log("New document created successfully");
      }

      toast({
        title: "Succès !",
        description: "Votre CV a été sauvegardé avec succès.",
      });
      
      // Navigate back to resumes list
      console.log("Navigating back to resumes list");
      navigate("/resumes");
    } catch (error) {
      console.error("Error saving CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du CV",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateNewCV = async () => {
    if (!cvName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour votre CV",
        variant: "destructive",
      });
      return;
    }
    
    setCvNameDialogOpen(false);
    
    // Create an empty CV with just the name if no job description yet
    if (!jobDescription.trim()) {
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
      
      setIsSubmitting(true);
      console.log("Creating new empty CV in Firestore...");
      
      try {
        const userDocRef = doc(db, "users", user.uid);
        console.log("User doc reference for empty CV:", userDocRef.path);
        
        const userDoc = await getDoc(userDocRef);
        
        let userProfile: Partial<Profile> = {};
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profile) {
            userProfile = userData.profile;
          }
        }
        
        // Create a new empty CV object
        const newCV: CV = {
          job_raw: "",
          cv_name: cvName,
          cv_data: {
            educations: [],
            lang_of_cv: "français",
            hobbies: userProfile.hobbies || "",
            languages: [],
            phone: userProfile.head?.phone || "",
            mail: userProfile.head?.mail || "",
            title: userProfile.head?.title || "",
            sections_name: {
              experience_section_name: "Expérience professionnelle",
              Hobbies_section: "Centres d'intérêt",
              languages_section_name: "Langues",
              skills_section_name: "Compétences",
              education_section_name: "Formation"
            },
            skills: [],
            experiences: [],
            name: userProfile.head?.name || ""
          }
        };
        
        console.log("New empty CV object created:", newCV);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const existingCvs = userData.cvs || [];
          const updatedCvs = [...existingCvs, newCV];
          
          console.log("Updating user document with new empty CV:", updatedCvs);
          await updateDoc(userDocRef, { cvs: updatedCvs });
          console.log("Document updated with empty CV");
        } else {
          console.log("Creating new user document with empty CV");
          await setDoc(userDocRef, {
            cvs: [newCV],
            profile: userProfile
          });
          console.log("New document with empty CV created");
        }
      } catch (error) {
        console.error("Error creating empty CV:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création du CV",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // If job description is already filled, save the CV immediately
      await handleGenerateResume();
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
