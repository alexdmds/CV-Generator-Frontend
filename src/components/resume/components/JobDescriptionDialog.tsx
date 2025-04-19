
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface JobDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (jobDescription: string) => void;
  isSubmitting?: boolean;
}

export function JobDescriptionDialog({
  open, 
  onOpenChange,
  onConfirm,
  isSubmitting = false
}: JobDescriptionDialogProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = () => {
    // Validation simple
    if (!jobDescription.trim()) {
      setValidationError("Veuillez saisir une description de poste");
      return;
    }
    
    // Réinitialiser l'erreur si valide
    setValidationError("");
    
    // Soumettre la description
    onConfirm(jobDescription);
  };

  const handleCancel = () => {
    // Si la soumission est en cours, ne pas permettre l'annulation
    if (isSubmitting) {
      return;
    }
    
    // Réinitialiser l'état et fermer la boîte de dialogue
    setJobDescription("");
    setValidationError("");
    onOpenChange(false);
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Bloquer la fermeture pendant la soumission
        if (isSubmitting && !isOpen) {
          return;
        }
        
        if (!isOpen) {
          // Si on ferme, réinitialiser les états
          setJobDescription("");
          setValidationError("");
        }
        
        onOpenChange(isOpen);
      }}
    >
      <AlertDialogContent className="sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Fiche de poste</AlertDialogTitle>
          <AlertDialogDescription>
            Copiez-collez la fiche de poste complète pour générer un CV optimisé pour ce poste.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Description du poste</Label>
            <Textarea
              id="jobDescription"
              placeholder="Collez ici la description complète du poste..."
              rows={10}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (e.target.value.trim()) {
                  setValidationError("");
                }
              }}
              className={validationError ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className={`bg-primary hover:bg-primary/90 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
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
