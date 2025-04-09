
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";
import { useEffect } from "react";
import { CVPreviewPanel } from "@/components/resume/components/CVPreviewPanel";
import { CVNameHeader } from "@/components/resume/components/CVNameHeader";
import { BackToResumesButton } from "@/components/resume/components/BackToResumesButton";

const ResumeForm = () => {
  const {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    handleDialogOpenChange,
    cvName,
    setCvName,
    isEditing,
    isSubmitting,
    handleGenerateResume,
    handleCreateNewCV,
    handleSaveJobDescription,
    navigate,
    confirmDialogOpen,
    setConfirmDialogOpen,
    confirmGenerateCV,
    isGenerating,
    isChecking,
    pdfUrl,
    checkForExistingCV,
    hasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV,
    refreshPdfDisplay
  } = useResumeForm();

  // On vérifie l'existence du CV en arrière-plan, sans bloquer l'interface
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      console.log(`Checking for existing CV on component mount in background: ${cvName}`);
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV, hasCheckedForExistingCV, isCheckingInProgress]);

  const handleCreateClick = async () => {
    await handleCreateNewCV();
  };

  const handleRenameClick = () => {
    handleDialogOpenChange(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <BackToResumesButton 
          onClick={() => navigate("/resumes")} 
          disabled={isSubmitting || isGenerating} 
        />
        
        <CVNameHeader 
          cvName={cvName} 
          onRenameClick={handleRenameClick} 
          isGenerating={isGenerating} 
        />
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Fiche de poste (toujours affichée) */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Modifier le CV" : "Nouveau CV"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobDescriptionForm 
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  onGenerateClick={handleGenerateResume}
                  onSaveClick={handleSaveJobDescription}
                  isEditing={isEditing}
                  cvName={cvName}
                  isSubmitting={isSubmitting || isGenerating}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Panneau latéral pour le CV */}
          <div className="w-full lg:w-1/2">
            <CVPreviewPanel
              isGenerating={isGenerating}
              isChecking={isChecking}
              pdfUrl={pdfUrl}
              cvName={cvName}
              checkFailed={checkFailed}
              retryCheckForExistingCV={retryCheckForExistingCV}
              refreshPdfDisplay={refreshPdfDisplay}
            />
          </div>
        </div>
      </div>
      
      <CvNameDialog
        open={cvNameDialogOpen}
        onOpenChange={handleDialogOpenChange}
        cvName={cvName}
        setCvName={setCvName}
        onCreateClick={handleCreateClick}
        isSubmitting={isSubmitting}
      />

      <GenerateConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmGenerateCV}
        isSubmitting={isSubmitting}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default ResumeForm;
