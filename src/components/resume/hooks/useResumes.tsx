
import { useLoadResumes } from "./useLoadResumes";
import { useDeleteResume } from "./useDeleteResume";
import { useRenameResume } from "./useRenameResume";
import { useState, useEffect } from "react";

export const useResumes = () => {
  const { resumes, setResumes, isLoading, refreshResumes } = useLoadResumes();
  const { deleteResume } = useDeleteResume(resumes, setResumes);
  const { renameResume } = useRenameResume(resumes, setResumes);
  
  // Écouter les événements de suppression de CV
  useEffect(() => {
    const handleCVDeleted = () => {
      console.log("CV supprimé, rafraîchissement de la liste");
      refreshResumes();
    };
    
    window.addEventListener('cv-deleted', handleCVDeleted as EventListener);
    
    return () => {
      window.removeEventListener('cv-deleted', handleCVDeleted as EventListener);
    };
  }, [refreshResumes]);

  return {
    resumes,
    isLoading,
    deleteResume,
    renameResume,
    refreshResumes
  };
};
