
import { useState } from "react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { RenameDialog } from "./RenameDialog";

type ResumeActionsProps = {
  deleteResume: (cvId: string) => Promise<boolean>;
  renameResume: (cvId: string, newName: string) => Promise<boolean>;
};

export const ResumeActions = ({ deleteResume, renameResume }: ResumeActionsProps) => {
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (cvToDelete) {
      console.log("Confirming deletion of CV with ID:", cvToDelete);
      const success = await deleteResume(cvToDelete);
      
      // Only close the dialog if deletion was successful
      if (success) {
        setDeleteConfirmOpen(false);
        setCvToDelete(null);
      }
    }
  };

  // Handle rename confirmation
  const handleConfirmRename = async () => {
    if (cvToRename && newCvName.trim()) {
      console.log("Confirming rename of CV with ID:", cvToRename);
      const success = await renameResume(cvToRename, newCvName.trim());
      
      // Only close the dialog if rename was successful
      if (success) {
        setRenameDialogOpen(false);
        setCvToRename(null);
        setNewCvName("");
      }
    }
  };

  // Dialogs JSX
  const dialogs = (
    <>
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
      />
      
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        value={newCvName}
        onChange={setNewCvName}
        onConfirm={handleConfirmRename}
      />
    </>
  );

  return {
    cvToDelete,
    setCvToDelete,
    cvToRename,
    setCvToRename,
    newCvName,
    setNewCvName,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    renameDialogOpen,
    setRenameDialogOpen,
    handleConfirmDelete,
    handleConfirmRename,
    dialogs
  };
};
