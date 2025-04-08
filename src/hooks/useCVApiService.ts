
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV, getDirectPdfUrl } from "@/utils/apiService";
import { usePdfViewer } from "./usePdfViewer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";

export function useCVApiService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    setPdfUrl,
    setLoadFailed,
    getDownloadPdfUrl,
  } = usePdfViewer();

  // Check if a CV exists on Firebase Storage and set up the PDF URL
  const checkExistingCVAndDisplay = useCallback(async (cvName: string, showToast = true) => {
    if (!cvName) return false;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder aux CVs",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      // Début de la vérification
      setIsChecking(true);
      setLoadFailed(false);
      console.log(`Checking for existing CV: ${cvName}`);

      // Vérifier si le CV existe dans Firestore d'abord
      let cvExistsInFirestore = false;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const cvs = userData.cvs || [];
          
          // Vérifier si un CV avec ce nom existe dans les données Firestore
          const existingCV = cvs.find((cv: any) => cv.cv_name === cvName);
          
          if (existingCV) {
            console.log("CV found in Firestore data");
            cvExistsInFirestore = true;
            
            // Définir l'URL directe immédiatement
            const directUrl = getDirectPdfUrl(user.uid, cvName);
            console.log("Setting direct PDF URL from Firestore check:", directUrl);
            setPdfUrl(directUrl);
          }
        }
      } catch (firestoreError) {
        console.warn("Error checking Firestore for CV:", firestoreError);
      }

      // Définir l'URL directe immédiatement pour un chargement rapide
      const immediateUrl = getDirectPdfUrl(user.uid, cvName);
      console.log("Setting immediate PDF URL:", immediateUrl);
      setPdfUrl(immediateUrl);
      
      // Puis tenter d'obtenir une URL de téléchargement plus fiable
      try {
        const downloadUrl = await getDownloadPdfUrl(user.uid, cvName);
        if (downloadUrl) {
          console.log("Setting download URL:", downloadUrl);
          setPdfUrl(downloadUrl);
        }
      } catch (error) {
        console.warn("Error getting download URL, continuing with direct URL:", error);
      }
      
      // En arrière-plan, vérifier si le CV existe réellement dans Storage
      let pdfUrl;
      try {
        pdfUrl = await checkExistingCV(user, cvName);
      } catch (storageCheckError) {
        console.warn("Storage check failed:", storageCheckError);
        // Si la vérification de Storage échoue mais que nous avons trouvé le CV dans Firestore
        if (cvExistsInFirestore) {
          pdfUrl = immediateUrl;
        }
      }
      
      if (pdfUrl || cvExistsInFirestore) {
        console.log("CV found with URL:", pdfUrl || immediateUrl);
        setPdfUrl(pdfUrl || immediateUrl);
        
        if (showToast) {
          toast({
            title: "CV trouvé",
            description: "Le CV est disponible",
          });
        }
        return true;
      } else {
        console.log("CV not found or inaccessible");
        setLoadFailed(true);
        if (showToast) {
          toast({
            title: "CV non trouvé",
            description: "Aucun CV n'a été trouvé avec ce nom",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error checking for existing CV:", error);
      setLoadFailed(true);
      if (showToast) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'existence du CV",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [getDownloadPdfUrl, navigate, setPdfUrl, setLoadFailed, toast]);

  // Call the CV generation API
  const generateCV = useCallback(async (cvName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      setIsGenerating(true);
      setLoadFailed(false);

      const result = await generateCVApi(user, cvName);

      if (result.success && result.pdfPath) {
        console.log("CV generated successfully, setting PDF URL:", result.pdfPath);
        setPdfUrl(result.pdfPath);
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        return true;
      } else {
        throw new Error(result.message || "Échec de la génération du CV");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [navigate, setPdfUrl, setLoadFailed, toast]);

  return {
    isGenerating,
    isChecking,
    generateCV,
    checkExistingCVAndDisplay
  };
}
