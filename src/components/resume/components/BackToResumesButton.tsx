
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackToResumesButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const BackToResumesButton = ({ 
  onClick,
  disabled = false 
}: BackToResumesButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Utiliser la navigation par défaut vers la page des CVs
      navigate("/resumes");
    }
  };
  
  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="mb-6 flex items-center gap-2"
      disabled={disabled}
    >
      <ArrowLeft className="w-4 h-4" />
      Retour aux CVs
    </Button>
  );
};
