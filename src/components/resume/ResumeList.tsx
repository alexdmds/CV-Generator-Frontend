
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/components/auth/firebase-config";
import { CV } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { ResumesGrid } from "./components/ResumesGrid";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { RenameDialog } from "./components/RenameDialog";
import { useResumes } from "./hooks/useResumes";
import { CvNameDialog } from "./components/CvNameDialog";

export const ResumeList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");
  const [cvNameDialogOpen, setCvNameDialogOpen] = useState(false);
  const [newCvNameInput, setNewCvNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumes, deleteResume, renameResume } = useResumes();

  const handleResumeClick = (resume?: CV) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour accéder à vos CVs",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (resume) {
      navigate(`/resumes/${resume.cv_name}`);
    } else {
      // Open the dialog instead of navigating directly
      setNewCvNameInput("");
      setCvNameDialogOpen(true);
    }
  };

  const handleCreateNewCV = async () => {
    setIsSubmitting(true);
    try {
      if (newCvNameInput.trim()) {
        navigate(`/resumes/new?name=${encodeURIComponent(newCvNameInput)}`);
        setCvNameDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCV = async () => {
    if (cvToDelete) {
      await deleteResume(cvToDelete);
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

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Mes CV</CardTitle>
          <Button
            onClick={() => handleResumeClick()}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau CV
          </Button>
        </CardHeader>
        <CardContent>
          <ResumesGrid 
            resumes={resumes}
            onResumeClick={handleResumeClick}
            onRenameClick={(resume) => {
              setCvToRename(resume.cv_name);
              setNewCvName(resume.cv_name);
              setRenameDialogOpen(true);
            }}
            onDeleteClick={(resume) => {
              setCvToDelete(resume.cv_name);
              setDeleteConfirmOpen(true);
            }}
          />
        </CardContent>
      </Card>

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

      <CvNameDialog 
        open={cvNameDialogOpen}
        onOpenChange={setCvNameDialogOpen}
        cvName={newCvNameInput}
        setCvName={setNewCvNameInput}
        onCreateClick={handleCreateNewCV}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
