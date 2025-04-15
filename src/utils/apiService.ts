
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

// Méthode simplifiée pour obtenir l'URL directe sans passer par Firebase
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
    
    // On ne fait pas de vérification d'existence, on suppose que le fichier existe
    // et on laisse le navigateur gérer l'affichage d'erreur si nécessaire
    return directUrl;
    
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
  // Renvoyer directement l'URL construite sans vérification
  return getDirectPdfUrl(userId, cvName);
};

/**
 * Génère un CV en appelant l'API de génération de CV
 */
export const generateCVApi = async (
  user: User,
  cvId: string
): Promise<GenerateCVResponse> => {
  try {
    // Obtenir le token Firebase
    const token = await user.getIdToken(true);
    
    console.log("Making API call to generate CV with ID:", cvId);
    
    if (!cvId || cvId.trim() === "") {
      console.error("CV ID is missing or empty in generateCVApi:", cvId);
      throw new Error("L'ID du CV est manquant ou invalide");
    }
    
    // Vérifier que le document existe avant de faire l'appel API
    const cvDocRef = doc(db, "cvs", cvId);
    const cvDoc = await getDoc(cvDocRef);
    
    if (!cvDoc.exists()) {
      console.error("Document does not exist in Firestore:", cvId);
      throw new Error("Le document CV n'existe pas dans Firestore");
    }
    
    // Faire l'appel API avec la nouvelle URL et le cv_id
    const requestBody = JSON.stringify({ cv_id: cvId });
    console.log("Request body for API call:", requestBody);
    
    // Timeout de 90 secondes (1min30)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    const response = await fetch("https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/v2/generate-cv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: requestBody,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("API Response status:", response.status);
    console.log("API Response headers:", Object.fromEntries([...response.headers]));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", response.status, errorText);
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("CV generation API response:", data);
    
    return {
      success: true,
      message: "CV généré avec succès"
    };
  } catch (error) {
    console.error("Error calling CV generation API:", error);
    
    // Handle abort error differently
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        message: "La génération a pris trop de temps et a été annulée. Veuillez réessayer."
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue"
    };
  }
};
