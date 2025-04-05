
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, FileText, Loader2, PencilIcon } from "lucide-react";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";
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
    pdfUrl
  } = useResumeForm();

  // Wrap the function to match expected void return type
  const handleCreateClick = async () => {
    await handleCreateNewCV();
  };

  // Handler to open the rename dialog
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
        
        {isGenerating ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">Génération du CV en cours...</h3>
              <p className="text-sm text-gray-500 mt-2">Le processus peut prendre jusqu'à 1 minute.</p>
            </div>
            
            {pdfUrl && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Votre CV est prêt !</h3>
                <iframe 
                  src={pdfUrl}
                  className="w-full h-[70vh] border border-gray-300 rounded-md"
                  title="CV généré"
                />
                <div className="mt-4 flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/resumes")}
                  >
                    Retour aux CVs
                  </Button>
                  <Button 
                    as="a" 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </Button>
                </div>
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
                isSubmitting={isSubmitting || isGenerating}
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
