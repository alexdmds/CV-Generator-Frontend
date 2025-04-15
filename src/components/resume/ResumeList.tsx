
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/components/auth/firebase-config";
import { CV } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { ResumesGrid } from "./components/ResumesGrid";
import { useResumes } from "./hooks/useResumes";
import { GenerateResumeDialog } from "./components/GenerateResumeDialog";
import { ResumeActions } from "./components/ResumeActions";
import { ResumeLoadingState } from "./components/ResumeLoadingState";
import { NewResumeButton } from "./components/NewResumeButton";

export const ResumeList = () => {
  const [jobDescriptionDialogOpen, setJobDescriptionDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumes, isLoading, deleteResume, renameResume } = useResumes();
  
  // Use the ResumeActions component
  const resumeActions = ResumeActions({ 
    deleteResume, 
    renameResume 
  });

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
      if ((resume as any).id) {
        navigate(`/resumes/${(resume as any).id}`);
      } else {
        toast({
          title: "Erreur",
          description: "ID du CV manquant",
          variant: "destructive",
        });
      }
    } else {
      setJobDescriptionDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <ResumeLoadingState />
      ) : (
        <>
          <NewResumeButton onClick={() => handleResumeClick()} />
          
          <ResumesGrid 
            resumes={resumes}
            onResumeClick={handleResumeClick}
            onRenameClick={(resume) => {
              if ((resume as any).id) {
                resumeActions.setCvToRename((resume as any).id);
                resumeActions.setNewCvName(resume.cv_name);
                resumeActions.setRenameDialogOpen(true);
              } else {
                console.error("Resume missing ID:", resume);
                toast({
                  title: "Erreur",
                  description: "ID du CV manquant pour le renommage",
                  variant: "destructive",
                });
              }
            }}
            onDeleteClick={(resume) => {
              if ((resume as any).id) {
                console.log("Setting CV to delete with ID:", (resume as any).id);
                resumeActions.setCvToDelete((resume as any).id);
                resumeActions.setDeleteConfirmOpen(true);
              } else {
                console.error("Resume missing ID:", resume);
                toast({
                  title: "Erreur",
                  description: "ID du CV manquant pour la suppression",
                  variant: "destructive",
                });
              }
            }}
          />
        </>
      )}

      {/* Dialog components */}
      {resumeActions.dialogs}
      
      <GenerateResumeDialog
        jobDescriptionDialogOpen={jobDescriptionDialogOpen}
        setJobDescriptionDialogOpen={setJobDescriptionDialogOpen}
        confirmDialogOpen={confirmDialogOpen}
        setConfirmDialogOpen={setConfirmDialogOpen}
      />
    </div>
  );
};
