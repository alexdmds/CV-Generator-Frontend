
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { CV } from "@/types/profile";

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
      
      // If we have the CV but no PDF URL, construct the correct Storage URL
      if (existingCV) {
        // Correctly formatted Firebase Storage URL
        const pdfPath = `https://firebasestorage.googleapis.com/v0/b/cv-generator-447314.appspot.com/o/${user.uid}%2Fcvs%2F${encodeURIComponent(cvName)}.pdf?alt=media`;
        console.log("Constructed PDF URL:", pdfPath);
        return pdfPath;
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
    // Fall back to generating it using the correct Firebase Storage URL format
    const pdfPath = data.pdfUrl || data.pdf_url || 
      `https://firebasestorage.googleapis.com/v0/b/cv-generator-447314.appspot.com/o/${user.uid}%2Fcvs%2F${encodeURIComponent(cvName)}.pdf?alt=media`;
    
    return {
      success: true,
      pdfPath
    };
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
