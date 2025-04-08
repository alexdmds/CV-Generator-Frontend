
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
 * Vérifie si un CV avec le nom donné existe déjà pour l'utilisateur
 */
export const checkExistingCV = async (
  user: User,
  cvName: string
): Promise<string | null> => {
  try {
    console.log(`Starting check for existing CV with name: ${cvName}`);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Première approche: vérifier si le CV existe déjà dans Firestore
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const cvs = userData.cvs || [];
      
      // Trouver le CV avec le nom correspondant
      const existingCV = cvs.find((cv: CV) => cv.cv_name === cvName);
      
      if (existingCV && existingCV.pdf_url) {
        console.log("Found existing CV with PDF URL in Firestore:", existingCV.pdf_url);
        return existingCV.pdf_url;
      }
      
      // Si nous avons le CV mais pas d'URL PDF, essayer de le récupérer directement dans Storage
      if (existingCV) {
        try {
          const url = await getStoragePdfUrl(user.uid, cvName);
          if (url) {
            console.log("Retrieved PDF URL from Storage:", url);
            return url;
          }
        } catch (storageError) {
          console.error("Error accessing PDF in Storage:", storageError);
        }
      }
    }
    
    // Deuxième approche: essayer directement dans Storage même si pas dans Firestore
    try {
      const url = await getStoragePdfUrl(user.uid, cvName);
      if (url) {
        console.log("Found PDF directly in Storage:", url);
        return url;
      }
    } catch (directError) {
      console.error("Error accessing PDF directly in Storage:", directError);
    }
    
    console.log("No existing CV found with name:", cvName);
    return null;
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

/**
 * Récupère l'URL d'un PDF dans Firebase Storage
 */
export const getStoragePdfUrl = async (userId: string, cvName: string): Promise<string | null> => {
  // Utiliser encodeURIComponent pour gérer les espaces et caractères spéciaux dans le nom
  // mais aussi essayer avec d'autres encodages courants
  const encodings = [
    encodeURIComponent(cvName),
    cvName.replace(/ /g, '%20'),
    cvName
  ];
  
  let lastError = null;
  
  // Essayer chaque encodage possible
  for (const encodedName of encodings) {
    try {
      const storagePath = `${userId}/cvs/${encodedName}.pdf`;
      console.log(`Trying storage path: ${storagePath}`);
      
      const storageRef = ref(storage, storagePath);
      
      // Ajouter un timeout de 10s pour éviter les attentes trop longues
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout getting download URL")), 10000);
      });
      
      // Essayer de récupérer l'URL avec un timeout
      const url = await Promise.race([
        getDownloadURL(storageRef),
        timeoutPromise
      ]) as string;
      
      if (url) {
        return url;
      }
    } catch (err) {
      lastError = err;
      console.log(`Failed with encoding ${encodedName}:`, err);
      // Continuer avec le prochain encodage
    }
  }
  
  // Essayer une dernière approche: reconstruire l'URL manuellement (public bucket)
  try {
    // URL directe pour un bucket public
    const directUrl = `https://storage.googleapis.com/cv-generator-447314.firebasestorage.app/${userId}/cvs/${encodeURIComponent(cvName)}.pdf`;
    console.log("Trying direct public URL:", directUrl);
    
    // Vérifier si l'URL est accessible
    const response = await fetch(directUrl, { method: 'HEAD' });
    if (response.ok) {
      return directUrl;
    }
  } catch (directError) {
    console.error("Direct URL access failed:", directError);
  }
  
  if (lastError) {
    console.error("All attempts to get PDF failed. Last error:", lastError);
  }
  
  return null;
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
    
    // Attendre un court instant pour que le fichier soit bien disponible
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tenter d'obtenir une URL authentifiée fraîche depuis Firebase Storage
    try {
      const url = await getStoragePdfUrl(user.uid, cvName);
      if (url) {
        console.log("Retrieved fresh authenticated URL after generation:", url);
        return {
          success: true,
          pdfPath: url
        };
      }
    } catch (storageError) {
      console.error("Error getting fresh URL after generation:", storageError);
    }
    
    // Utiliser l'URL de l'API en fallback
    if (data.pdfUrl || data.pdf_url) {
      return {
        success: true,
        pdfPath: data.pdfUrl || data.pdf_url
      };
    }
    
    throw new Error("Impossible d'accéder au PDF généré");
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
