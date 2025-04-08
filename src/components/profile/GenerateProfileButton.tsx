
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface GenerateProfileButtonProps {
  isGenerating: boolean;
}

export const GenerateProfileButton = ({ isGenerating }: GenerateProfileButtonProps) => {
  return (
    <AlertDialogTrigger asChild>
      <Button
        type="button"
        className="w-full"
        variant="default"
        disabled={isGenerating}
      >
        <FileText className="mr-2" />
        {isGenerating ? "Génération en cours..." : "Générer mon profil"}
      </Button>
    </AlertDialogTrigger>
  );
};
