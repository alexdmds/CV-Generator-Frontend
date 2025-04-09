
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackToResumesButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function BackToResumesButton({ 
  onClick, 
  disabled = false,
  className = "mb-6",
  children = "Retour aux CVs"
}: BackToResumesButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
      disabled={disabled}
    >
      <ArrowLeft className="w-4 h-4" />
      {children}
    </Button>
  );
}
