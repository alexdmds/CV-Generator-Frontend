
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { JobDescriptionForm } from "@/components/resume/components/JobDescriptionForm";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";
import { useEffect, useState } from "react";
import { CVPreviewPanel } from "@/components/resume/components/CVPreviewPanel";
import { CVNameHeader } from "@/components/resume/components/CVNameHeader";
import { BackToResumesButton } from "@/components/resume/components/BackToResumesButton";
import { useSearchParams, useParams } from "react-router-dom";
import { CVDetailsPanel } from "@/components/resume/components/CVDetailsPanel";
import { db } from "@/components/auth/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const ResumeForm = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const jobDescriptionParam = searchParams.get('jobDescription');
  const [jobSumup, setJobSumup] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
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

  // Fetch CV details including job_sumup if in view mode
  useEffect(() => {
    const fetchCVDetails = async () => {
      if (id && id !== 'new') {
        try {
          setIsLoadingDetails(true);
          const cvDocRef = doc(db, "cvs", id);
          const cvDoc = await getDoc(cvDocRef);
          
          if (cvDoc.exists()) {
            const cvData = cvDoc.data();
            setJobDescription(cvData.job_raw || "");
            setCvName(cvData.cv_name || "");
            setJobSumup(cvData.job_sumup || null);
            console.log("CV data loaded for view:", cvData);
          }
        } catch (error) {
          console.error("Error loading CV details:", error);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };
    
    fetchCVDetails();
  }, [id, setCvName, setJobDescription]);

  // Récupérer la fiche de poste depuis l'URL si disponible
  useEffect(() => {
    if (jobDescriptionParam && !jobDescription) {
      setJobDescription(decodeURIComponent(jobDescriptionParam));
      // Si c'est un nouveau CV, on ouvre la boîte de dialogue pour le nommer
      if (!isEditing) {
        handleDialogOpenChange(true);
      }
    }
  }, [jobDescriptionParam, jobDescription, setJobDescription, isEditing, handleDialogOpenChange]);

  // On vérifie l'existence du CV en arrière-plan, sans bloquer l'interface
  useEffect(() => {
    if (cvName && !hasCheckedForExistingCV && !isCheckingInProgress) {
      console.log(`Checking for existing CV on component mount in background: ${cvName}`);
      checkForExistingCV(cvName);
    }
  }, [cvName, checkForExistingCV, hasCheckedForExistingCV, isCheckingInProgress]);

  const isViewMode = id && id !== 'new';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <BackToResumesButton 
          onClick={() => navigate("/resumes")} 
          disabled={isSubmitting || isGenerating} 
        />
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{cvName}</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Détails du CV (toujours affichés en mode visualisation) */}
          <div className="flex-1">
            {isViewMode ? (
              isLoadingDetails ? (
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
              ) : (
                <CVDetailsPanel 
                  cvName={cvName}
                  jobDescription={jobDescription}
                  jobSumup={jobSumup}
                />
              )
            ) : (
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
            )}
          </div>
          
          {/* Panneau latéral pour le CV */}
          <div className="w-full lg:w-1/2">
            <CVPreviewPanel
              isGenerating={isGenerating}
              isChecking={isChecking}
              pdfUrl={pdfUrl}
              cvName={cvName}
              cvId={id}
              checkFailed={checkFailed}
              retryCheckForExistingCV={retryCheckForExistingCV}
              refreshPdfDisplay={refreshPdfDisplay}
            />
          </div>
        </div>
      </div>
      
      {!isViewMode && (
        <>
          <CvNameDialog
            open={cvNameDialogOpen}
            onOpenChange={handleDialogOpenChange}
            cvName={cvName}
            setCvName={setCvName}
            onCreateClick={handleCreateNewCV}
            isSubmitting={isSubmitting}
          />

          <GenerateConfirmDialog 
            open={confirmDialogOpen}
            onOpenChange={setConfirmDialogOpen}
            onConfirm={confirmGenerateCV}
            isSubmitting={isSubmitting}
            isGenerating={isGenerating}
          />
        </>
      )}
    </div>
  );
}

export default ResumeForm;
