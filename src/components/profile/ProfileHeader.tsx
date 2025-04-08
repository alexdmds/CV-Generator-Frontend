
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { LastGeneration } from "./LastGeneration";

interface ProfileHeaderProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ProfileHeader = ({ hasChanges, isSaving, onSave }: ProfileHeaderProps) => {
  return (
    <CardHeader className="relative">
      <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
      <LastGeneration />
      {hasChanges && (
        <div className="absolute right-4 top-4">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </div>
      )}
    </CardHeader>
  );
};
