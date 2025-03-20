
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useCVNameDialog(isEditing: boolean, initialCvName: string = "") {
  const [cvNameDialogOpen, setCvNameDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Handle when user tries to close the CV name dialog
  const handleDialogOpenChange = (open: boolean) => {
    // Only allow closing the dialog if we're editing an existing CV
    // or a name has been provided for a new CV
    if (isEditing || (initialCvName.trim() !== "" && !open)) {
      setCvNameDialogOpen(open);
    } else if (!open && window.location.pathname.includes("/new")) {
      // If trying to close without a name during new CV creation, navigate back
      navigate("/resumes");
    } else {
      setCvNameDialogOpen(open);
    }
  };

  return {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  };
}
