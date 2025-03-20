
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface CvNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cvName: string;
  setCvName: (name: string) => void;
  onCreateClick: () => Promise<void>;
  isSubmitting?: boolean;
}

export function CvNameDialog({ 
  open, 
  onOpenChange, 
  cvName, 
  setCvName, 
  onCreateClick,
  isSubmitting = false
}: CvNameDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cvName.trim()) {
      await onCreateClick();
    }
  };

  const closeButtonClick = () => {
    // Only allow closing if we have a CV name
    if (cvName.trim()) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Nommez votre CV</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={closeButtonClick}
            disabled={!cvName.trim()}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        </DialogHeader>
        <DialogDescription>
          Donnez un nom à votre CV pour l'identifier facilement plus tard.
        </DialogDescription>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="cvName">Nom du CV <span className="text-red-500">*</span></Label>
            <Input
              id="cvName"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="Ex: Développeur React - Société X"
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ce champ est obligatoire</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!cvName.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
