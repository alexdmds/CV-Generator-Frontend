
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { CV, Profile } from "@/types/profile";
import { createCVFromProfile } from "./cvFactory";

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
  const profileDocRef = doc(db, "profiles", userId);
  const profileDoc = await getDoc(profileDocRef);
  
  if (profileDoc.exists()) {
    return profileDoc.data() as Profile;
  }
  
  return {};
}

/**
 * Saves a CV to Firestore in the "cvs" collection
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
    // Get user profile for CV generation
    const userProfile = await getUserProfile(user.uid);
    console.log("User profile retrieved for CV:", userProfile);
    
    // Create a new CV object with required structure
    const newCV = createCVFromProfile(userProfile as Profile, jobDescription, cvName);
    console.log("New CV object created:", newCV);
    
    // Check if CV with same name already exists in the "cvs" collection
    const cvsQuery = query(
      collection(db, "cvs"), 
      where("user_id", "==", user.uid),
      where("cv_name", "==", cvName)
    );
    
    const querySnapshot = await getDocs(cvsQuery);
    
    if (!querySnapshot.empty) {
      // Update existing CV
      const cvDocRef = querySnapshot.docs[0].ref;
      await updateDoc(cvDocRef, {
        job_raw: jobDescription,
        cv_data: newCV.cv_data
      });
      console.log("Existing CV updated in 'cvs' collection");
    } else {
      // Create new CV document in the "cvs" collection
      const cvData = {
        user_id: user.uid,
        cv_name: cvName,
        job_raw: jobDescription,
        cv_data: newCV.cv_data
      };
      
      // Add to "cvs" collection
      await setDoc(doc(collection(db, "cvs")), cvData);
      console.log("New CV created in 'cvs' collection");
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
