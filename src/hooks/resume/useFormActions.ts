
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCVGeneration } from "../useCVGeneration";

export function useFormActions(
  cvName: string, 
  jobDescription: string, 
  setHasCheckedForExistingCV: (value: boolean) => void,
  setIsCheckingInProgress: (value: boolean) => void,
  setCheckFailed: (value: boolean) => void
) {
  const navigate = useNavigate();
  const { checkExistingCVAndDisplay } = useCVGeneration();

  const checkForExistingCV = async (name: string) => {
    if (!name) return false;
    
    setIsCheckingInProgress(true);
    
    try {
      console.log(`Starting non-blocking CV check for: ${name}`);
      
      // Set immediate candidate URL for PDF
      const checkResult = await checkExistingCVAndDisplay(name, false);
      setCheckFailed(!checkResult);
      
      return checkResult;
    } catch (error) {
      console.error("Error in non-blocking checkForExistingCV:", error);
      setCheckFailed(true);
      return false;
    } finally {
      setHasCheckedForExistingCV(true);
      setIsCheckingInProgress(false);
    }
  };

  const retryCheckForExistingCV = (name: string) => {
    if (!name) return false;
    
    setHasCheckedForExistingCV(false);
    setCheckFailed(false);
    return true;
  };

  return {
    navigate,
    checkForExistingCV,
    retryCheckForExistingCV
  };
}
