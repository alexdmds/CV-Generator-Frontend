
import { Navbar } from "@/components/layout/Navbar";
import { BackToResumesButton } from "@/components/resume/components/BackToResumesButton";
import { useResumeForm } from "@/hooks/useResumeForm";
import { CvNameDialog } from "@/components/resume/components/CvNameDialog";
import { GenerateConfirmDialog } from "@/components/resume/components/GenerateConfirmDialog";

interface ResumeFormContainerProps {
  children: React.ReactNode;
  title: string;
  isGenerating: boolean;
  isSubmitting: boolean;
  onBackClick: () => void;
  isViewMode: boolean;
  cvNameDialogOpen: boolean;
  handleDialogOpenChange: (open: boolean) => void;
  cvName: string;
  setCvName: (name: string) => void;
  handleCreateNewCV: () => Promise<boolean>;  // Updated to match the actual return type
  confirmDialogOpen: boolean;
  setConfirmDialogOpen: (open: boolean) => void;
  confirmGenerateCV: () => void;
}

export function ResumeFormContainer({
  children,
  title,
  isGenerating,
  isSubmitting,
  onBackClick,
  isViewMode,
  cvNameDialogOpen,
  handleDialogOpenChange,
  cvName,
  setCvName,
  handleCreateNewCV,
  confirmDialogOpen,
  setConfirmDialogOpen,
  confirmGenerateCV
}: ResumeFormContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <BackToResumesButton 
          onClick={onBackClick} 
          disabled={isSubmitting || isGenerating} 
        />
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        
        {children}
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
