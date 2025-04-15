
import { Button } from "@/components/ui/button";
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
import { JobDescriptionDialog } from "./components/JobDescriptionDialog";

export const ResumeList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");
  const [jobDescriptionDialogOpen, setJobDescriptionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumes, isLoading, deleteResume, renameResume } = useResumes();

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
      // Ouvrir directement la boîte de dialogue pour la fiche de poste
      setJobDescriptionDialogOpen(true);
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Chargement de vos CVs...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => handleResumeClick()}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau CV
            </Button>
          </div>
          
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
        </>
      )}

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

      <JobDescriptionDialog 
        open={jobDescriptionDialogOpen}
        onOpenChange={setJobDescriptionDialogOpen}
        onConfirm={(jobDescription) => navigate(`/resumes/new?jobDescription=${encodeURIComponent(jobDescription)}`)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
