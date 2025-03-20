
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { CV, Profile } from "@/types/profile";
import { Toast } from "@/components/ui/toast";

interface CreateCVOptions {
  user: { uid: string };
  cvName: string;
  jobDescription: string;
  toast: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  };
}

/**
 * Creates a new CV object with the required structure
 */
export const createCVObject = (cvName: string, jobDescription: string, userProfile: Partial<Profile> = {}): CV => {
  console.log("Creating new CV object with name:", cvName);
  
  return {
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
};

/**
 * Saves a CV to Firestore
 */
export const saveCVToFirestore = async ({ 
  user, 
  cvName, 
  jobDescription, 
  toast 
}: CreateCVOptions): Promise<boolean> => {
  if (!user) {
    console.error("No user found when trying to save CV");
    return false;
  }
  
  console.log("Saving CV to Firestore for user:", user.uid);
  
  try {
    // Get user document reference
    const userDocRef = doc(db, "users", user.uid);
    console.log("User doc reference for CV save:", userDocRef.path);
    
    // Get user profile for CV generation if exists
    const userDoc = await getDoc(userDocRef);
    
    let userProfile: Partial<Profile> = {};
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User document data retrieved:", userData);
      
      if (userData.profile) {
        userProfile = userData.profile;
        console.log("User profile retrieved for CV:", userProfile);
      } else {
        console.log("No user profile found, using empty profile");
      }
    } else {
      console.log("User document does not exist, will create a new one");
    }
    
    // Create a new CV object with required structure
    const newCV = createCVObject(cvName, jobDescription, userProfile);
    console.log("New CV object created:", newCV);
    
    // Save to Firestore
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const existingCvs = userData.cvs || [];
      
      // Check if CV with same name already exists
      const existingCvIndex = existingCvs.findIndex((cv: CV) => cv.cv_name === cvName);
      
      let updatedCvs;
      if (existingCvIndex >= 0) {
        console.log("Updating existing CV with name:", cvName);
        // Replace the CV with the same name
        updatedCvs = [...existingCvs];
        updatedCvs[existingCvIndex] = newCV;
      } else {
        console.log("Adding new CV with name:", cvName);
        // Add new CV
        updatedCvs = [...existingCvs, newCV];
      }
      
      console.log("Updating user document with new CVs array:", updatedCvs);
      // Update the document with the new CV
      await updateDoc(userDocRef, { cvs: updatedCvs });
      console.log("Document updated successfully with new CV");
    } else {
      console.log("Creating new user document with CV");
      // Create new user document with the CV
      await setDoc(userDocRef, {
        cvs: [newCV],
        profile: userProfile
      });
      console.log("New document created successfully with CV");
    }

    toast({
      title: "Succès !",
      description: "Votre CV a été sauvegardé avec succès.",
    });
    
    return true;
  } catch (error) {
    console.error("Error saving CV:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la sauvegarde du CV",
      variant: "destructive",
    });
    return false;
  }
};
