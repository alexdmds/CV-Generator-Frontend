
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface GenerateProfileButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

export const GenerateProfileButton = ({ isGenerating, onClick }: GenerateProfileButtonProps) => {
  return (
    <Button
      type="button"
      className="w-full"
      variant="default"
      disabled={isGenerating}
      onClick={onClick}
    >
      <FileText className="mr-2" />
      {isGenerating ? "Génération en cours..." : "Générer mon profil"}
    </Button>
  );
};
