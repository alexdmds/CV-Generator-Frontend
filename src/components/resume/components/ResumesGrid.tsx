
import React from 'react';
import { CV } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2 } from "lucide-react";

interface ResumesGridProps {
  resumes: CV[];
  onResumeClick: (resume?: CV) => void;
  onRenameClick: (resume: CV) => void;
  onDeleteClick: (resume: CV) => void;
}

export const ResumesGrid: React.FC<ResumesGridProps> = ({
  resumes,
  onResumeClick,
  onRenameClick,
  onDeleteClick
}) => {
  // Debug the resumes data
  React.useEffect(() => {
    if (resumes.length > 0) {
      console.log("Resumes data:", resumes);
    } else {
      console.log("No resumes found in the grid component");
    }
  }, [resumes]);

  if (resumes.length === 0) {
    return (
      <div 
        className="text-center py-8 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => onResumeClick()}
      >
        <FileText className="w-12 h-12 mx-auto mb-4" />
        <p>Vous n'avez pas encore de CV. Créez-en un nouveau !</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {resumes.map((resume, index) => {
        // Get the resume ID safely
        const resumeId = (resume as any).id || '';
        
        // Fallback for CV name if it's missing
        const resumeName = resume.cv_name || 'CV sans nom';
        
        // Use a combination of ID and index for the key to ensure uniqueness
        const displayKey = resumeId ? `cv-${resumeId}` : `cv-${index}-${Date.now()}`;
        
        if (!resumeId) {
          console.warn(`CV missing ID at index ${index}:`, resume);
        }
        
        return (
          <Card 
            key={displayKey}
            className="relative cursor-pointer hover:bg-gray-50 group"
          >
            <CardContent 
              className="flex items-center gap-4 p-4"
              onClick={() => resumeId ? onResumeClick(resume) : console.warn("Cannot click CV without ID")}
            >
              <FileText className="w-8 h-8 text-gray-500" />
              <div className="flex-grow">
                <h3 className="font-medium">
                  {resumeName}
                  {!resumeId && <span className="text-red-500 text-xs ml-2">(ID manquant)</span>}
                </h3>
                {resume.creation_date && (
                  <p className="text-xs text-gray-500">
                    Créé le: {new Date(resume.creation_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {resumeId && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameClick(resume);
                      }}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(resume);
                      }}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
