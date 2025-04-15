
import { useState } from "react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { RenameDialog } from "./RenameDialog";
import { CV } from "@/types/profile";

interface ResumeActionsProps {
  deleteResume: (id: string) => Promise<void>;
  renameResume: (id: string, newName: string) => Promise<void>;
}

export function ResumeActions({ deleteResume, renameResume }: ResumeActionsProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");

  const handleDeleteCV = async () => {
    if (cvToDelete) {
      console.log("Deleting CV with ID:", cvToDelete);
      await deleteResume(cvToDelete);
    } else {
      console.error("No CV ID to delete");
    }
    setDeleteConfirmOpen(false);
    setCvToDelete(null);
  };

  const handleRenameCV = async () => {
    if (cvToRename && newCvName) {
      await renameResume(cvToRename, newCvName);
    }
    setRenameDialogOpen(false);
    setCvToRename(null);
    setNewCvName("");
  };

  return {
    // Dialog states
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    renameDialogOpen,
    setRenameDialogOpen,
    
    // Action states
    cvToDelete,
    setCvToDelete,
    cvToRename, 
    setCvToRename,
    newCvName,
    setNewCvName,
    
    // Action handlers
    handleDeleteCV,
    handleRenameCV,
    
    // Dialog components
    dialogs: (
      <>
        <DeleteConfirmDialog 
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDeleteCV}
        />

        <RenameDialog 
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          newName={newCvName}
          onNewNameChange={setNewCvName}
          onConfirm={handleRenameCV}
        />
      </>
    )
  };
}
