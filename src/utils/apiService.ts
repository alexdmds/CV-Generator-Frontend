
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

export const getDirectPdfUrl = (userId: string, cvIdOrName: string, cvName?: string): string => {
  const encodedId = encodeURIComponent(cvIdOrName);
  console.log(`Constructing PDF URL for user ${userId}, CV ID: ${encodedId}`);
  return `https://storage.googleapis.com/cv-generator-447314.firebasestorage.app/${userId}/cvs/${encodedId}.pdf`;
};

export const checkExistingCV = async (
  user: User,
  cvName: string
): Promise<string | null> => {
  try {
    const directUrl = getDirectPdfUrl(user.uid, cvName);
    console.log("Trying direct public URL:", directUrl);
    return directUrl;
  } catch (error) {
    console.error("Error checking for existing CV:", error);
    return null;
  }
};

export const getStoragePdfUrl = async (userId: string, cvIdOrName: string, cvName?: string): Promise<string | null> => {
  return getDirectPdfUrl(userId, cvIdOrName, cvName);
};

export const generateCVApi = async (
  user: User,
  cvId: string
): Promise<GenerateCVResponse> => {
  try {
    const token = await user.getIdToken(true);
    
    console.log("Making API call to generate CV with ID:", cvId);
    
    if (!cvId || cvId.trim() === "") {
      console.error("CV ID is missing or empty in generateCVApi:", cvId);
      throw new Error("L'ID du CV est manquant ou invalide");
    }
    
    const cvDocRef = doc(db, "cvs", cvId);
    const cvDoc = await getDoc(cvDocRef);
    
    if (!cvDoc.exists()) {
      console.error("Document does not exist in Firestore:", cvId);
      throw new Error("Le document CV n'existe pas dans Firestore");
    }
    
    // Create a new AbortController for the request timeout
    const controller = new AbortController();
    // Set a timeout of 90 seconds (1min30)
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    const response = await fetch("https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/v2/generate-cv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ cv_id: cvId }),
      signal: controller.signal
    });

    // Clear the timeout once the request completes
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
