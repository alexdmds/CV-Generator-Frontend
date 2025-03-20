import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useCVNameDialog(isEditing: boolean, initialCvName: string = "") {
  const [cvNameDialogOpen, setCvNameDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Handle when user tries to close the CV name dialog
  const handleDialogOpenChange = (open: boolean) => {
    // If the dialog is being opened, always allow it
    if (open) {
      setCvNameDialogOpen(open);
      return;
    }
    
    // If we're editing an existing CV or we have a name, allow closing
    if (isEditing || initialCvName.trim() !== "") {
      setCvNameDialogOpen(false);
    } else {
      // If we're creating a new CV and don't have a name yet,
      // keep the dialog open (don't navigate away)
      setCvNameDialogOpen(true);
    }
  };

  return {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    handleDialogOpenChange
  };
}
