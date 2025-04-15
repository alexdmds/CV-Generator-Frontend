
import { useCallback } from "react";
import { useResumeActions } from "../useResumeActions";

export function useFormHandlers(
  cvName: string, 
  jobDescription: string, 
  isEditing: boolean,
  setCvName: (name: string) => void
) {
  const {
    handleCreateNewCV,
    handleSaveJobDescriptionWithState,
    openConfirmDialog,
    confirmGenerateCV
  } = useResumeActions(cvName, setCvName, jobDescription, isEditing);

  const handleGenerateResume = useCallback(() => {
    openConfirmDialog();
  }, [openConfirmDialog]);

  const handleSaveJobDescription = useCallback(async () => {
    return handleSaveJobDescriptionWithState(true);
  }, [handleSaveJobDescriptionWithState]);

  const handleCreateClick = useCallback(async () => {
    return await handleCreateNewCV();
  }, [handleCreateNewCV]);

  return {
    handleGenerateResume,
    handleSaveJobDescription,
    handleCreateClick,
    confirmGenerateCV
  };
}
