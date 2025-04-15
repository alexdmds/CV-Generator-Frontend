
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { CVDetailsPanel } from "@/components/resume/components/CVDetailsPanel";
import { CVPreviewPanel } from "@/components/resume/components/CVPreviewPanel";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumeContentProps {
  isViewMode: boolean;
  isLoadingDetails: boolean;
  cvName: string;
  jobDescription: string;
  jobSumup: string | null;
  setJobDescription: (description: string) => void;
  handleGenerateResume: () => void;
  handleSaveJobDescription: () => Promise<boolean>;
  isEditing: boolean;
  isSubmitting: boolean;
  isGenerating: boolean;
  isChecking: boolean;
  pdfUrl: string | null;
  cvId?: string;
  checkFailed: boolean;
  retryCheckForExistingCV: (cvName: string) => void;
  refreshPdfDisplay: (userId: string, cvId: string, cvName?: string) => string;
}

export function ResumeContent({
  isViewMode,
  isLoadingDetails,
  cvName,
  jobDescription,
  jobSumup,
  setJobDescription,
  handleGenerateResume,
  handleSaveJobDescription,
  isEditing,
  isSubmitting,
  isGenerating,
  isChecking,
  pdfUrl,
  cvId,
  checkFailed,
  retryCheckForExistingCV,
  refreshPdfDisplay
}: ResumeContentProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Détails du CV (toujours affichés en mode visualisation) */}
      <div className="flex-1">
        {isViewMode ? (
          <LoadingDetailsOrContent 
            isLoadingDetails={isLoadingDetails}
            cvName={cvName}
            jobDescription={jobDescription}
            jobSumup={jobSumup}
          />
        ) : (
          <EditModeContent 
            isEditing={isEditing}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onGenerateClick={handleGenerateResume}
            onSaveClick={handleSaveJobDescription}
            cvName={cvName}
            isSubmitting={isSubmitting || isGenerating}
          />
        )}
      </div>
      
      {/* Panneau latéral pour le CV */}
      <div className="w-full lg:w-1/2">
        <CVPreviewPanel
          isGenerating={isGenerating}
          isChecking={isChecking}
          pdfUrl={pdfUrl}
          cvName={cvName}
          cvId={cvId}
          checkFailed={checkFailed}
          retryCheckForExistingCV={retryCheckForExistingCV}
          refreshPdfDisplay={refreshPdfDisplay}
        />
      </div>
    </div>
  );
}

function LoadingDetailsOrContent({ 
  isLoadingDetails, 
  cvName, 
  jobDescription, 
  jobSumup 
}: { 
  isLoadingDetails: boolean; 
  cvName: string; 
  jobDescription: string; 
  jobSumup: string | null;
}) {
  if (isLoadingDetails) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-full" />
            
            <Skeleton className="h-4 w-[150px] mt-6" />
            <Skeleton className="h-24 w-full" />
            
            <Skeleton className="h-4 w-[150px] mt-6" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <CVDetailsPanel 
      cvName={cvName}
      jobDescription={jobDescription}
      jobSumup={jobSumup}
    />
  );
}

function EditModeContent({
  isEditing,
  jobDescription,
  setJobDescription,
  onGenerateClick,
  onSaveClick,
  cvName,
  isSubmitting
}: {
  isEditing: boolean;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  onGenerateClick: () => void;
  onSaveClick: () => Promise<boolean>;
  cvName: string;
  isSubmitting: boolean;
}) {
  return (
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
          onGenerateClick={onGenerateClick}
          onSaveClick={onSaveClick}
          isEditing={isEditing}
          cvName={cvName}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
