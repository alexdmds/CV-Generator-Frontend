
import { useResumeForm } from "@/hooks/useResumeForm";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { db } from "@/components/auth/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { ResumeFormContainer } from "@/components/resume/components/ResumeFormContainer";
import { ResumeContent } from "@/components/resume/components/ResumeContent";

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
    <ResumeFormContainer
      title={cvName}
      isGenerating={isGenerating}
      isSubmitting={isSubmitting}
      onBackClick={() => navigate("/resumes")}
      isViewMode={isViewMode}
      cvNameDialogOpen={cvNameDialogOpen}
      handleDialogOpenChange={handleDialogOpenChange}
      cvName={cvName}
      setCvName={setCvName}
      handleCreateNewCV={handleCreateNewCV}
      confirmDialogOpen={confirmDialogOpen}
      setConfirmDialogOpen={setConfirmDialogOpen}
      confirmGenerateCV={confirmGenerateCV}
    >
      <ResumeContent
        isViewMode={isViewMode}
        isLoadingDetails={isLoadingDetails}
        cvName={cvName}
        jobDescription={jobDescription}
        jobSumup={jobSumup}
        setJobDescription={setJobDescription}
        handleGenerateResume={handleGenerateResume}
        handleSaveJobDescription={handleSaveJobDescription}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        isGenerating={isGenerating}
        isChecking={isChecking}
        pdfUrl={pdfUrl}
        cvId={id}
        checkFailed={checkFailed}
        retryCheckForExistingCV={retryCheckForExistingCV}
        refreshPdfDisplay={refreshPdfDisplay}
      />
    </ResumeFormContainer>
  );
}

export default ResumeForm;
