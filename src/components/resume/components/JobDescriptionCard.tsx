
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobDescriptionForm } from "./JobDescriptionForm";

interface JobDescriptionCardProps {
  isEditing: boolean;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  onGenerateClick: () => void;
  onSaveClick: () => Promise<boolean>;
  cvName: string;
  isSubmitting: boolean;
}

export const JobDescriptionCard = ({
  isEditing,
  jobDescription,
  setJobDescription,
  onGenerateClick,
  onSaveClick,
  cvName,
  isSubmitting
}: JobDescriptionCardProps) => {
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
};
