
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackToResumesButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const BackToResumesButton = ({ 
  onClick,
  disabled = false 
}: BackToResumesButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="mb-6 flex items-center gap-2"
      disabled={disabled}
    >
      <ArrowLeft className="w-4 h-4" />
      Retour aux CVs
    </Button>
  );
};
