
import { useState } from "react";

export function useDialogStates() {
  const [cvNameDialogOpen, setCvNameDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  return {
    cvNameDialogOpen,
    setCvNameDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen
  };
}
