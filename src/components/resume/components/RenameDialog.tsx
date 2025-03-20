
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
  onConfirm: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  onOpenChange,
  newName,
  onNewNameChange,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer le CV</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="newName">Nouveau nom</Label>
          <Input
            id="newName"
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="Entrez le nouveau nom"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>
            Renommer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
