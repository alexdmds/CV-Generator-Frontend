
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, FileText, Loader2, PencilIcon, RefreshCcw, FileX } from "lucide-react";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Button
          variant="ghost"
          onClick={() => navigate("/resumes")}
          className="mb-6 flex items-center gap-2"
          disabled={isSubmitting || isGenerating}
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
            disabled={isGenerating}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Modifier le nom</span>
          </Button>
        </div>
        
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Aperçu du CV</span>
                  {isChecking && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="p-6 text-center">
                    <ProfileGeneratingIndicator 
                      message="Génération du CV en cours..."
                    />
                  </div>
                ) : pdfUrl ? (
                  <div className="rounded-md overflow-hidden border border-gray-300">
                    <iframe 
                      src={pdfUrl}
                      className="w-full h-[500px]"
                      title="CV généré"
                      onError={() => {
                        console.error("Failed to load PDF, setting checkFailed to true");
                        retryCheckForExistingCV();
                      }}
                    />
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="default" 
                        onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Télécharger le PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="mb-4 flex flex-col items-center justify-center">
                      <FileX className="w-16 h-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">CV pas encore généré</h3>
                      <p className="text-gray-500 mt-2">
                        Aucun CV n'a encore été généré avec ce nom.
                      </p>
                      {checkFailed && (
                        <Button 
                          variant="outline" 
                          onClick={retryCheckForExistingCV}
                          className="mt-4 flex items-center"
                          size="sm"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Vérifier à nouveau
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
