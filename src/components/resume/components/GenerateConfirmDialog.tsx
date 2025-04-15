
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
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing the dialog while submitting
      if (isSubmitting && !isOpen) {
        return;
      }
      onOpenChange(isOpen);
    }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSubmitting ? "Préparation en cours..." : "Générer le CV"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSubmitting 
              ? "Nous préparons votre demande de génération..."
              : "Assurez-vous que votre profil est bien renseigné dans la section \"Profil\" avant de générer le CV. Le processus peut prendre jusqu'à 1 minute 30."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isSubmitting && (
          <div className="py-4">
            <Progress value={progress} className="h-2 mb-3" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Préparation en cours... {progress.toFixed(0)}%</p>
            </div>
          </div>
        )}
        
        <AlertDialogFooter>
          {isSubmitting ? (
            <p className="text-xs text-muted-foreground w-full text-center">
              Veuillez patienter pendant la préparation
            </p>
          ) : (
            <>
              <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Préparation...
                  </>
                ) : (
                  "Confirmer"
                )}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
