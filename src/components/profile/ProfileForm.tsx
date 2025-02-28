
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PhotoUpload } from "./PhotoUpload";
import { DocumentList } from "./DocumentList";
import { LastGeneration } from "./LastGeneration";
import { TokenCounter } from "./TokenCounter";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const ProfileForm = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  const handleGenerateCV = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour générer votre profil.",
      });
      navigate("/");
      return;
    }

    setIsGenerating(true);
    toast({
      title: "Génération du profil",
      description: "La génération de votre profil a commencé. Cela peut prendre quelques minutes...",
    });

    try {
      const token = await user.getIdToken();
      const response = await fetch(`https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/generate-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erreur lors de la génération du profil:", errorData);
        throw new Error(`Erreur: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log("Profil généré avec succès:", data);

      toast({
        title: "Profil généré",
        description: "Votre profil a été généré avec succès !",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du profil:", error);
      toast({
        variant: "destructive",
        title: "Échec de la génération",
        description: "Une erreur est survenue lors de la génération de votre profil. Veuillez réessayer.",
      });
    } finally {
      setIsGenerating(false);
    }
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
            disabled={isGenerating}
          >
            <FileText className="mr-2" />
            {isGenerating ? "Génération en cours..." : "Générer mon profil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
