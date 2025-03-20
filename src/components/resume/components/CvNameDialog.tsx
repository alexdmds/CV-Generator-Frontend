
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CvNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cvName: string;
  setCvName: (name: string) => void;
  onCreateClick: () => void;
}

export function CvNameDialog({ 
  open, 
  onOpenChange, 
  cvName, 
  setCvName, 
  onCreateClick 
}: CvNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nommez votre CV</DialogTitle>
          <DialogDescription>
            Donnez un nom à votre CV pour l'identifier facilement plus tard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="cvName">Nom du CV</Label>
          <Input
            id="cvName"
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            placeholder="Ex: Développeur React - Société X"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={onCreateClick}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
