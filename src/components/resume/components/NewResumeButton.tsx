
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewResumeButtonProps {
  onClick: () => void;
}

export function NewResumeButton({ onClick }: NewResumeButtonProps) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onClick}
        className="flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        Nouveau CV
      </Button>
    </div>
  );
}
