import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "@/components/auth/firebase-config";
import { CV } from "@/types/profile";
import { ref, getDownloadURL } from "firebase/storage";

interface GenerateCVResponse {
  success: boolean;
  message?: string;
  pdfPath?: string;
}

/**
 * Checks if a CV with the given name already exists for the user
 */
export const checkExistingCV = async (
  user: User,
  cvName: string
): Promise<string | null> => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const cvs = userData.cvs || [];
      
      // Find the CV with the matching name
      const existingCV = cvs.find((cv: CV) => cv.cv_name === cvName);
      
      if (existingCV && existingCV.pdf_url) {
        console.log("Found existing CV with PDF URL:", existingCV.pdf_url);
        return existingCV.pdf_url;
      }
      
      // If we have the CV but no PDF URL, construct the path and get authenticated URL
      if (existingCV) {
        try {
          // Create a reference to the file in Firebase Storage
          const storageRef = ref(storage, `${user.uid}/cvs/${cvName}.pdf`);
          
          // Get the authenticated download URL
          const authenticatedUrl = await getDownloadURL(storageRef);
          console.log("Generated authenticated download URL:", authenticatedUrl);
          
          return authenticatedUrl;
        } catch (storageError) {
          console.error("Error getting authenticated download URL:", storageError);
          return null;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

/**
 * Generates a CV by calling the CV generation API
 */
export const generateCVApi = async (
  user: User,
  cvName: string
): Promise<GenerateCVResponse> => {
  try {
    // Obtain the Firebase token
    const token = await user.getIdToken(true);
    
    // Make the API call
    const response = await fetch("https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/generate-cv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ cv_name: cvName }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log("CV generation API response:", data);
    
    // Use the actual PDF URL from the API response if available
    if (data.pdfUrl || data.pdf_url) {
      return {
        success: true,
        pdfPath: data.pdfUrl || data.pdf_url
      };
    }
    
    // Otherwise, get an authenticated URL from Firebase Storage
    try {
      const storageRef = ref(storage, `${user.uid}/cvs/${cvName}.pdf`);
      const authenticatedUrl = await getDownloadURL(storageRef);
      
      return {
        success: true,
        pdfPath: authenticatedUrl
      };
    } catch (storageError) {
      console.error("Error getting authenticated download URL:", storageError);
      throw new Error("Impossible d'accéder au PDF généré");
    }
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
