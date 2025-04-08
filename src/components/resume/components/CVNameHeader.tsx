
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";

interface CVNameHeaderProps {
  cvName: string;
  onRenameClick: () => void;
  isGenerating: boolean;
}

export const CVNameHeader = ({ 
  cvName, 
  onRenameClick,
  isGenerating 
}: CVNameHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-center">
      <h2 className="text-2xl font-bold text-center">{cvName}</h2>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 ml-2" 
        onClick={onRenameClick}
        disabled={isGenerating}
      >
        <PencilIcon className="h-4 w-4" />
        <span className="sr-only">Modifier le nom</span>
      </Button>
    </div>
  );
};
