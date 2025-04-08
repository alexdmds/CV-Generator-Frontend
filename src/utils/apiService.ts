
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
    console.log(`Starting check for existing CV with name: ${cvName}`);
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
          const storagePath = `${user.uid}/cvs/${encodeURIComponent(cvName)}.pdf`;
          console.log(`Checking for PDF at path: ${storagePath}`);
          const storageRef = ref(storage, storagePath);
          
          // Set a shorter timeout for the download URL request (5 seconds)
          const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error("Timeout getting download URL")), 5000);
          });
          
          const urlPromise = getDownloadURL(storageRef);
          
          // Race between the download URL request and timeout
          const authenticatedUrl = await Promise.race([urlPromise, timeoutPromise]) as string;
          
          console.log("Generated authenticated download URL:", authenticatedUrl);
          return authenticatedUrl;
        } catch (storageError) {
          console.error("Error getting authenticated download URL:", storageError);
          // Return null to indicate no PDF was found, but don't throw an error
          return null;
        }
      }
    }
    
    console.log("No existing CV found with name:", cvName);
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
    
    // Always try to get a fresh authenticated URL from Firebase Storage
    try {
      const storagePath = `${user.uid}/cvs/${encodeURIComponent(cvName)}.pdf`;
      console.log("Trying to get authenticated URL for:", storagePath);
      
      const storageRef = ref(storage, storagePath);
      const authenticatedUrl = await getDownloadURL(storageRef);
      
      console.log("Retrieved fresh authenticated URL:", authenticatedUrl);
      return {
        success: true,
        pdfPath: authenticatedUrl
      };
    } catch (storageError) {
      console.error("Error getting fresh authenticated URL, falling back to API response:", storageError);
      
      // Fallback to the URL from the API response
      if (data.pdfUrl || data.pdf_url) {
        return {
          success: true,
          pdfPath: data.pdfUrl || data.pdf_url
        };
      }
      
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
