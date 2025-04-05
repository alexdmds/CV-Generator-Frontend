
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Save } from "lucide-react";

interface JobDescriptionFormProps {
  jobDescription: string;
  setJobDescription: (description: string) => void;
  onGenerateClick: () => void;
  onSaveClick?: () => Promise<boolean>;
  isEditing: boolean;
  cvName: string;
  isSubmitting?: boolean;
}

export function JobDescriptionForm({ 
  jobDescription, 
  setJobDescription, 
  onGenerateClick,
  onSaveClick,
  isEditing,
  cvName,
  isSubmitting = false
}: JobDescriptionFormProps) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          Copiez l'intégralité de la fiche de poste pour une meilleure qualité de génération.
        </p>
      </div>

      <div className="flex gap-3">
        {onSaveClick && (
          <Button
            type="button"
            onClick={onSaveClick}
            className="flex-1"
            variant="outline"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        )}
        
        <Button
          type="button"
          onClick={onGenerateClick}
          className="flex-1"
          disabled={!jobDescription.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Générer le CV
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
