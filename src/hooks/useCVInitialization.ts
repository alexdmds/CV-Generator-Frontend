
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCVData } from "./useCVData";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { useCVGeneration } from "./useCVGeneration";
import { getDirectPdfUrl } from "@/utils/apiService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";

export function useCVInitialization() {
  const { 
    cvName, 
    setCvName,
    id
  } = useCVData();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  const [hasCheckedForExistingCV, setHasCheckedForExistingCV] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  
  // Now this properly includes setPdfUrl from the useCVGeneration hook
  const { 
    checkExistingCVAndDisplay, 
    getImmediatePdfUrl, 
    setPdfUrl,
    getDownloadPdfUrl 
  } = useCVGeneration();
  
  // Get initial CV name from URL if present
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    const nameFromParams = params.id;
    
    if (nameFromParams && nameFromParams !== 'new') {
      // Décodage du nom du CV depuis l'URL
      const decodedName = decodeURIComponent(nameFromParams);
      setCvName(decodedName);
      console.log("CV name from URL params:", decodedName);
    } else if (nameFromUrl) {
      const decodedName = decodeURIComponent(nameFromUrl);
      setCvName(decodedName);
      console.log("CV name from URL query:", decodedName);
    }
  }, [searchParams, params, setCvName]);
  
  // Vérification non bloquante du CV existant avec méthode améliorée
  const checkForExistingCV = useCallback(async (name: string) => {
    if (!name || isCheckingInProgress) {
      return;
    }
    
    setIsCheckingInProgress(true);
    setCheckFailed(false);
    
    try {
      console.log(`Starting non-blocking CV check for: ${name}`);
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No authenticated user found");
        setCheckFailed(true);
        setIsCheckingInProgress(false);
        return;
      }
      
      // Vérifier si le CV existe dans Firestore (vérification supplémentaire)
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const cvs = userData.cvs || [];
          
          // Vérifier si un CV avec ce nom existe dans les données Firestore
          const existingCV = cvs.find((cv: any) => cv.cv_name === name);
          
          if (existingCV) {
            console.log("CV found in Firestore data");
            
            // Définir immédiatement une URL candidate pour le PDF
            const directUrl = getDirectPdfUrl(user.uid, name);
            console.log("Setting direct PDF URL from Firestore check:", directUrl);
            setPdfUrl(directUrl);
            
            // Ne pas marquer comme échec puisque le CV existe
            setCheckFailed(false);
          }
        }
      } catch (firestoreError) {
        console.warn("Error checking Firestore for CV:", firestoreError);
      }
      
      // Définir immédiatement une URL candidate pour le PDF
      const directUrl = getDirectPdfUrl(user.uid, name);
      console.log("Setting direct PDF URL:", directUrl);
      setPdfUrl(directUrl);
      
      // Essayer d'obtenir une URL de téléchargement plus fiable en arrière-plan
      try {
        const downloadUrl = await getDownloadPdfUrl(user.uid, name);
        if (downloadUrl) {
          console.log("Setting download URL from background check:", downloadUrl);
          setPdfUrl(downloadUrl);
        }
      } catch (error) {
        console.warn("Error getting download URL in background check:", error);
      }
      
      // Vérifier en arrière-plan sans bloquer l'interface
      setTimeout(async () => {
        try {
          // Faire une vérification réelle en arrière-plan
          const checkResult = await checkExistingCVAndDisplay(name, false);
          console.log(`Background CV check result: ${checkResult}`);
          setCheckFailed(!checkResult);
        } finally {
          setHasCheckedForExistingCV(true);
          setIsCheckingInProgress(false);
        }
      }, 0);
      
    } catch (error) {
      console.error("Error in non-blocking checkForExistingCV:", error);
      setCheckFailed(true);
      setIsCheckingInProgress(false);
    }
  }, [checkExistingCVAndDisplay, getImmediatePdfUrl, setPdfUrl, getDownloadPdfUrl, isCheckingInProgress]);
  
  // Function to retry checking if the first attempt failed
  const retryCheckForExistingCV = useCallback(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
      setCheckFailed(false);
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV]);
  
  // Réinitialiser le drapeau de vérification lorsque le nom du CV change
  useEffect(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
    }
  }, [cvName]);

  return {
    checkForExistingCV,
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV,
    navigate
  };
}
