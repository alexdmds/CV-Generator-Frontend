
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileText, PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/components/auth/firebase-config";
import { CV } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { ResumesGrid } from "./components/ResumesGrid";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { RenameDialog } from "./components/RenameDialog";
import { useResumes } from "./hooks/useResumes";
import { JobDescriptionDialog } from "./components/JobDescriptionDialog";
import { GenerateConfirmDialog } from "./components/GenerateConfirmDialog";
import { generateCVApi } from "@/utils/apiService";
import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "@/components/auth/firebase-config";
import { useCVGeneration } from "@/hooks/useCVGeneration";

export const ResumeList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");
  const [jobDescriptionDialogOpen, setJobDescriptionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingJobDescription, setPendingJobDescription] = useState("");
  const [pendingCvId, setPendingCvId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resumes, isLoading, deleteResume, renameResume } = useResumes();
  const { isGenerating, progress, generateCV } = useCVGeneration();

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
      navigate(`/resumes/${resume.id}`);
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

  const handleJobDescriptionSubmit = async (jobDescription: string) => {
    setIsSubmitting(true);
    setPendingJobDescription(jobDescription);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un CV",
          variant: "destructive",
        });
        return;
      }
      
      // Créer un document avec ID généré automatiquement
      const cvDocRef = doc(collection(db, "cvs"));
      const cvId = cvDocRef.id;
      
      // Générer un nom par défaut
      const defaultCvName = `CV - ${new Date().toLocaleDateString()}`;
      
      // Sauvegarder le document avec les données minimales requises
      await setDoc(cvDocRef, {
        user_id: user.uid,
        cv_id: cvId,
        cv_name: defaultCvName,
        job_raw: jobDescription,
        job_sumup: "",
        creation_date: new Date().toISOString()
      });
      
      console.log("Document CV créé avec succès:", cvId);
      
      setJobDescriptionDialogOpen(false);
      setPendingCvId(cvId);
      setConfirmDialogOpen(true);
      
    } catch (error) {
      console.error("Error creating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du CV",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmGenerate = async () => {
    if (!pendingCvId) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le CV sans identifiant",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Confirming generation for CV ID:", pendingCvId);
    const success = await generateCV(pendingCvId);
    
    if (success) {
      // Une fois la génération terminée, rafraîchir la liste des CV
      toast({
        title: "Succès",
        description: "Votre CV a été généré avec succès",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
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
              setCvToRename(resume.id || resume.cv_name);
              setNewCvName(resume.cv_name);
              setRenameDialogOpen(true);
            }}
            onDeleteClick={(resume) => {
              setCvToDelete(resume.id || resume.cv_name);
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
        onConfirm={handleJobDescriptionSubmit}
        isSubmitting={isSubmitting}
      />

      <GenerateConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmGenerate}
        isSubmitting={isSubmitting}
        isGenerating={isGenerating}
        progress={progress}
      />
    </div>
  );
};
