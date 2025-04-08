
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, FileText, Loader2, PencilIcon, RefreshCcw } from "lucide-react";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useEffect } from "react";

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
    setHasCheckedForExistingCV,
    isCheckingInProgress,
    checkFailed,
    retryCheckForExistingCV
  } = useResumeForm();

  // Check for existing CV when the component mounts or when cv name changes
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV, hasCheckedForExistingCV, isCheckingInProgress]);

  // Reset the check flag when CV name changes
  useEffect(() => {
    setHasCheckedForExistingCV(false);
  }, [cvName, setHasCheckedForExistingCV]);

  // Wrap the function to match expected void return type
  const handleCreateClick = async () => {
    await handleCreateNewCV();
  };

  // Handler to open the rename dialog
  const handleRenameClick = () => {
    handleDialogOpenChange(true);
  };

  const isLoading = isGenerating || isChecking;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/resumes")}
          className="mb-6 flex items-center gap-2"
          disabled={isSubmitting || isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux CVs
        </Button>
        
        <div className="mb-4 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-center">{cvName}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 ml-2" 
            onClick={handleRenameClick}
            disabled={isLoading}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Modifier le nom</span>
          </Button>
        </div>
        
        {(isLoading || pdfUrl) ? (
          <div className="w-full max-w-2xl mx-auto">
            {isLoading && !pdfUrl && (
              <ProfileGeneratingIndicator 
                message={isGenerating ? "Génération du CV en cours..." : "Recherche du CV existant..."}
              />
            )}
            
            {pdfUrl && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Votre CV est prêt !</h3>
                <div className="rounded-md overflow-hidden border border-gray-300">
                  <iframe 
                    src={pdfUrl}
                    className="w-full h-[70vh]"
                    title="CV généré"
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/resumes")}
                  >
                    Retour aux CVs
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </Button>
                </div>
              </div>
            )}
            
            {checkFailed && (
              <div className="mt-4 w-full flex flex-col items-center">
                <p className="text-red-500 mb-2">Impossible de trouver le CV existant.</p>
                <Button 
                  variant="outline" 
                  onClick={retryCheckForExistingCV}
                  className="flex items-center"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="w-full max-w-2xl mx-auto">
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
                isSubmitting={isSubmitting || isLoading}
              />
            </CardContent>
          </Card>
        )}
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
