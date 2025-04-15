
import { useLoadResumes } from "./useLoadResumes";
import { useDeleteResume } from "./useDeleteResume";
import { useRenameResume } from "./useRenameResume";

export const useResumes = () => {
  const { resumes, setResumes, isLoading } = useLoadResumes();
  const { deleteResume } = useDeleteResume(resumes, setResumes);
  const { renameResume } = useRenameResume(resumes, setResumes);

  return {
    resumes,
    isLoading,
    deleteResume,
    renameResume
  };
};
