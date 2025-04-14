
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

// Méthode pour obtenir l'URL directe sans passer par Firebase
export const getDirectPdfUrl = (userId: string, cvName: string): string => {
  // Utiliser la structure directe du bucket public
  const encodedName = encodeURIComponent(cvName);
  return `https://storage.googleapis.com/cv-generator-447314.firebasestorage.app/${userId}/cvs/${encodedName}.pdf`;
};

/**
 * Vérifie si un CV avec le nom donné existe déjà pour l'utilisateur
 * Version non-bloquante qui renvoie une promesse
 */
export const checkExistingCV = async (
  user: User,
  cvName: string
): Promise<string | null> => {
  try {
    // Essayer directement l'URL publique
    const directUrl = getDirectPdfUrl(user.uid, cvName);
    console.log("Trying direct public URL first:", directUrl);
    
    // Vérifier si le PDF existe avec un HEAD request
    const response = await fetch(directUrl, { method: 'HEAD' });
    if (response.ok) {
      console.log("PDF exists and is accessible");
      return directUrl;
    } else {
      console.log("PDF does not exist or is not accessible:", response.status);
      return null;
    }
    
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

/**
 * Récupère l'URL d'un PDF dans Firebase Storage
 * Version non-bloquante limitée à une seule tentative rapide
 */
export const getStoragePdfUrl = async (userId: string, cvName: string): Promise<string | null> => {
  try {
    const directUrl = getDirectPdfUrl(userId, cvName);
    
    // Vérifier si le PDF existe avec un HEAD request
    const response = await fetch(directUrl, { method: 'HEAD' });
    if (response.ok) {
      return directUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting PDF URL:", error);
    return null;
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
    
    // Utiliser directement l'URL construite
    const pdfUrl = getDirectPdfUrl(user.uid, cvName);
    
    return {
      success: true,
      pdfPath: pdfUrl
    };
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
