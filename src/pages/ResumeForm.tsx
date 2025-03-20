
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";

const ResumeForm = () => {
  const {
    jobDescription,
    setJobDescription,
    cvNameDialogOpen,
    setCvNameDialogOpen,
    cvName,
    setCvName,
    isEditing,
    handleGenerateResume,
    handleCreateNewCV,
    navigate
  } = useResumeForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/resumes")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux CVs
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {isEditing ? `Modifier le CV: ${cvName}` : "Nouveau CV"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JobDescriptionForm 
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onGenerateClick={handleGenerateResume}
              isEditing={isEditing}
              cvName={cvName}
            />
          </CardContent>
        </Card>
      </div>
      
      <CvNameDialog
        open={cvNameDialogOpen}
        onOpenChange={setCvNameDialogOpen}
        cvName={cvName}
        setCvName={setCvName}
        onCreateClick={handleCreateNewCV}
      />
    </div>
  );
};

export default ResumeForm;
