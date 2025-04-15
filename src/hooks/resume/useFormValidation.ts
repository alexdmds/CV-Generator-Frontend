
import { useState } from "react";

export function useFormValidation() {
  const [hasCheckedForExistingCV, setHasCheckedForExistingCV] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  return {
    hasCheckedForExistingCV,
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    setIsCheckingInProgress,
    checkFailed,
    setCheckFailed
  };
}
