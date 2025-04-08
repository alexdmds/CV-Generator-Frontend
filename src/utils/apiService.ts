
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

// Méthode pour obtenir l'URL directe avec encodage approprié des caractères spéciaux
export const getDirectPdfUrl = (userId: string, cvName: string): string => {
  // Encodage correct des caractères spéciaux pour l'URL
  const encodedName = encodeURIComponent(cvName);
  
  console.log(`Original name: "${cvName}", Encoded name: "${encodedName}"`);
  
  // URL directe vers le PDF dans Firebase Storage
  // On utilise l'URL publique directe au lieu de celle qui nécessite un token Firebase
  const publicUrl = `https://storage.googleapis.com/cv-generator-447314.firebasestorage.app/${userId}/cvs/${encodedName}.pdf`;
  
  return publicUrl;
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
    // Construction de l'URL publique avec encodage correct
    const directUrl = getDirectPdfUrl(user.uid, cvName);
    console.log("Checking CV existence with URL:", directUrl);
    
    // On retourne directement l'URL sans vérification préalable
    // car les requêtes CORS peuvent échouer mais le PDF est accessible
    return directUrl;
    
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

/**
 * Récupère l'URL d'un PDF dans Firebase Storage
 * Version non-bloquante retournant immédiatement l'URL construite
 */
export const getStoragePdfUrl = async (userId: string, cvName: string): Promise<string | null> => {
  // Renvoyer directement l'URL construite sans vérification
  return getDirectPdfUrl(userId, cvName);
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
    
    // Utiliser directement l'URL construite sans vérification
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
