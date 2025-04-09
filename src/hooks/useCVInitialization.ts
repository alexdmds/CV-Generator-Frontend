
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCVData } from "./useCVData";
import { auth } from "@/components/auth/firebase-config";

export function useCVInitialization() {
  const { 
    cvName, 
    setCvName,
    id
  } = useCVData();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const [hasCheckedForExistingCV, setHasCheckedForExistingCV] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  
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

  // Reset the check flag when CV name changes
  useEffect(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
    }
  }, [cvName]);

  // Function to retry checking if the first attempt failed
  const retryCheckForExistingCV = useCallback(() => {
    if (cvName) {
      setHasCheckedForExistingCV(false);
      setCheckFailed(false);
    }
  }, [cvName]);

  return {
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    setIsCheckingInProgress,
    checkFailed,
    setCheckFailed,
    retryCheckForExistingCV,
    navigate
  };
}
