
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

// Méthode plus robuste pour obtenir l'URL Firebase Storage
export const getDirectPdfUrl = (userId: string, cvName: string): string => {
  // Encodage correct pour les URLs Firebase Storage
  const encodedUserId = encodeURIComponent(userId);
  const encodedCvName = encodeURIComponent(cvName);
  
  console.log(`Generating direct URL for CV: userId=${userId}, cvName="${cvName}", encodedName="${encodedCvName}"`);
  
  // URL au format Firebase Storage compatible CORS
  return `https://firebasestorage.googleapis.com/v0/b/cv-generator-447314.appspot.com/o/${encodedUserId}%2Fcvs%2F${encodedCvName}.pdf?alt=media&token=public`;
};

/**
 * Vérifie si un CV avec le nom donné existe déjà pour l'utilisateur
 * Utilise getDownloadURL pour une vérification plus fiable
 */
export const checkExistingCV = async (
  user: User,
  cvName: string
): Promise<string | null> => {
  try {
    console.log(`Checking if CV exists: ${cvName}`);
    
    // Créer une référence au fichier dans Firebase Storage
    const fileRef = ref(storage, `${user.uid}/cvs/${cvName}.pdf`);
    
    try {
      // Tenter d'obtenir l'URL réelle via getDownloadURL
      const url = await getDownloadURL(fileRef);
      console.log("CV exists, download URL:", url);
      return url;
    } catch (error) {
      console.warn("getDownloadURL failed for checking, trying alternate method:", error);
      
      // Vérifier si le CV existe dans Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cvs = userData.cvs || [];
        
        // Vérifier si un CV avec ce nom existe dans les données Firestore
        const existingCV = cvs.find((cv: CV) => cv.cv_name === cvName);
        
        if (existingCV) {
          console.log("CV found in Firestore data, returning direct URL");
          return getDirectPdfUrl(user.uid, cvName);
        }
      }
      
      console.log("CV not found in Firestore either");
      return null;
    }
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

/**
 * Récupère l'URL d'un PDF dans Firebase Storage
 */
export const getStoragePdfUrl = async (userId: string, cvName: string): Promise<string | null> => {
  try {
    console.log(`Getting storage URL for CV: ${cvName}`);
    // Créer une référence au fichier
    const fileRef = ref(storage, `${userId}/cvs/${cvName}.pdf`);
    
    try {
      // Tenter d'obtenir l'URL via getDownloadURL
      const url = await getDownloadURL(fileRef);
      console.log("Successfully got download URL:", url);
      return url;
    } catch (error) {
      // Fallback vers URL directe
      console.warn("getDownloadURL failed, using direct URL:", error);
      const directUrl = getDirectPdfUrl(userId, cvName);
      console.log("Using direct URL instead:", directUrl);
      return directUrl;
    }
  } catch (error) {
    console.error("Error getting storage PDF URL:", error);
    return getDirectPdfUrl(userId, cvName);
  }
};

/**
 * Génère un CV en appelant l'API de génération de CV
 */
export const generateCVApi = async (
  user: User,
  cvName: string
): Promise<GenerateCVResponse> => {
  try {
    // Obtenir le token Firebase
    const token = await user.getIdToken(true);
    
    // Faire l'appel API
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
    
    // Obtenir l'URL du PDF généré
    try {
      const fileRef = ref(storage, `${user.uid}/cvs/${cvName}.pdf`);
      const pdfUrl = await getDownloadURL(fileRef);
      return {
        success: true,
        pdfPath: pdfUrl
      };
    } catch (error) {
      // Fallback vers URL directe
      console.warn("getDownloadURL failed after generation, using direct URL:", error);
      const directUrl = getDirectPdfUrl(user.uid, cvName);
      return {
        success: true,
        pdfPath: directUrl
      };
    }
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
