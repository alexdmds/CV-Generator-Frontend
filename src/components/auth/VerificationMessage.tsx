
import { Button } from "@/components/ui/button";

interface VerificationMessageProps {
  onBack: () => void;
}

export const VerificationMessage = ({ onBack }: VerificationMessageProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="text-lg font-medium">Email de vérification envoyé</div>
      <p className="text-muted-foreground">
        Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.
      </p>
      <Button
        onClick={onBack}
        variant="outline"
        className="mt-4"
      >
        Retour à la connexion
      </Button>
    </div>
  );
};
