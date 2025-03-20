
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { CV, Profile } from "@/types/profile";
import { createCVObject } from "./cvFactory";

interface ToastFunction {
  (props: { 
    title: string; 
    description: string; 
    variant?: "default" | "destructive" 
  }): void;
}

interface CreateCVOptions {
  user: { uid: string };
  cvName: string;
  jobDescription: string;
  toast: ToastFunction;
}

/**
 * Retrieves user profile data from Firestore
 */
async function getUserProfile(userId: string): Promise<Partial<Profile>> {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.profile) {
      return userData.profile;
    }
  }
  
  return {};
}

/**
 * Updates existing CV or adds a new one to the user's CVs array
 */
async function updateUserCVs(
  userDocRef: any, 
  existingCvs: CV[], 
  newCV: CV
): Promise<boolean> {
  // Check if CV with same name already exists
  const existingCvIndex = existingCvs.findIndex((cv: CV) => cv.cv_name === newCV.cv_name);
  
  let updatedCvs;
  if (existingCvIndex >= 0) {
    console.log("Updating existing CV with name:", newCV.cv_name);
    // Replace the CV with the same name
    updatedCvs = [...existingCvs];
    updatedCvs[existingCvIndex] = newCV;
  } else {
    console.log("Adding new CV with name:", newCV.cv_name);
    // Add new CV
    updatedCvs = [...existingCvs, newCV];
  }
  
  console.log("Updating user document with new CVs array:", updatedCvs);
  // Update the document with the new CV
  await updateDoc(userDocRef, { cvs: updatedCvs });
  
  return true;
}

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
    
    // Get user profile for CV generation
    const userProfile = await getUserProfile(user.uid);
    console.log("User profile retrieved for CV:", userProfile);
    
    // Create a new CV object with required structure
    const newCV = createCVObject(cvName, jobDescription, userProfile);
    console.log("New CV object created:", newCV);
    
    // Get user document to check if it exists
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const existingCvs = userData.cvs || [];
      
      await updateUserCVs(userDocRef, existingCvs, newCV);
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
