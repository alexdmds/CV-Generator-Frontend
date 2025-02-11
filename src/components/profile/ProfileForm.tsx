
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PhotoUpload } from "./PhotoUpload";
import { DocumentList } from "./DocumentList";
import { LastGeneration } from "./LastGeneration";
import { TokenCounter } from "./TokenCounter";

export const ProfileForm = () => {
  const { toast } = useToast();

  const handleGenerateCV = () => {
    toast({
      title: "Génération du profil",
      description: "La génération de votre profil va commencer...",
    });
    // TODO: Implémenter la génération du profil
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
        <LastGeneration />
        <TokenCounter />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PhotoUpload />
          <DocumentList />
          <Button
            type="button"
            onClick={handleGenerateCV}
            className="w-full"
            variant="default"
          >
            <FileText className="mr-2" />
            Générer mon profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
