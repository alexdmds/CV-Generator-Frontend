
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onConfirm(jobDescription);
      setJobDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle fiche de poste</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Copiez-collez la fiche de poste complète pour générer un CV adapté.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="py-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Copiez-collez ici l'intégralité de la fiche de poste..."
              className="min-h-[300px] w-full"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!jobDescription.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : "Créer un CV"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
