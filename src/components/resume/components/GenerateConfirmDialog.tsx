
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GenerateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isGenerating?: boolean;
  progress?: number;
}

export function GenerateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  isGenerating = false,
  progress = 0,
}: GenerateConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Générer le CV</AlertDialogTitle>
          <AlertDialogDescription>
            Assurez-vous que votre profil est bien renseigné dans la section "Profil" avant de générer le CV.
            Le processus peut prendre jusqu'à 1 minute.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {(isSubmitting || isGenerating) && (
          <div className="py-2">
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              Génération en cours... {progress}%
            </p>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting || isGenerating}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting || isGenerating}>
            {isSubmitting || isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              "Confirmer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
