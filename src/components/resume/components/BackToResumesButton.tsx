
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
      // Assurer que la navigation se fait correctement vers /resumes
      try {
        navigate("/resumes");
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback en cas d'erreur de navigation
        window.location.href = "/resumes";
      }
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
