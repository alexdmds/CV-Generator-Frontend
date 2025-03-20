
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface JobDescriptionFormProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
  onGenerateClick: () => void;
  isEditing: boolean;
  cvName: string;
}

export function JobDescriptionForm({ 
  jobDescription, 
  setJobDescription, 
  onGenerateClick,
  isEditing,
  cvName
}: JobDescriptionFormProps) {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
          Fiche de poste
        </label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Copiez-collez ici l'intégralité de la fiche de poste..."
          className="min-h-[300px] w-full"
        />
        <p className="text-xs text-gray-500">
          Copiez l'intégralité de la fiche de poste pour une meilleure qualité de génération.
        </p>
      </div>

      <Button
        type="button"
        onClick={onGenerateClick}
        className="w-full"
      >
        <FileText className="w-4 h-4 mr-2" />
        Générer le CV
      </Button>
    </form>
  );
}
