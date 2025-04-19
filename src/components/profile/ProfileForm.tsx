
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PhotoUpload } from "./PhotoUpload";
import { DocumentList } from "./DocumentList";
import { LastGeneration } from "./LastGeneration";
import { TokenCounter } from "./TokenCounter";
import { useProfileGeneration } from "@/hooks/useProfileGeneration";
import { GenerateProfileButton } from "./GenerateProfileButton";
import { GenerateProfileDialog } from "./GenerateProfileDialog";
import { useState, useEffect } from "react";
import { FileText, Wand, Check, Upload } from "lucide-react";
import { ProfileGenerationLoader } from "./ProfileGenerationLoader";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  refreshTokens: () => void;
}

export const ProfileForm = ({ isGenerating, setIsGenerating, refreshTokens }: ProfileFormProps) => {
  const { 
    confirmOpen, 
    setConfirmOpen, 
    handleGenerateCV,
    handleTimeout 
  } = useProfileGeneration(refreshTokens);

  // Effet pour synchroniser l'état de génération
  useEffect(() => {
    console.log("État de génération dans ProfileForm:", isGenerating);
    return () => {
      console.log("Démontage de ProfileForm");
    };
  }, [isGenerating]);

  const handleGenerateButtonClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmGeneration = async () => {
    // Mettre à jour l'état isGenerating avant d'appeler handleGenerateCV
    setIsGenerating(true);
    await handleGenerateCV();
    // Note: nous n'avons pas besoin de remettre isGenerating à false ici,
    // car c'est géré dans le hook useProfileGeneration
  };

  // Si isGenerating est true, nous affichons le loader à la place du formulaire
  if (isGenerating) {
    return <ProfileGenerationLoader onTimeout={handleTimeout} />;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
        <LastGeneration />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Wand className="mr-2 text-blue-600" />
              Comment utiliser la plateforme
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <Upload className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>1. Téléchargez vos documents</strong><br />
                  Importez vos fichiers PDF ou TXT : CV, fiches de poste, profil LinkedIn...
                </span>
              </li>
              <li className="flex items-start">
                <Wand className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>2. Générez votre profil</strong><br />
                  Cliquez sur "Générer mon profil" pour créer automatiquement votre CV.
                </span>
              </li>
              <li className="flex items-start">
                <FileText className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>3. Vérifiez et complétez</strong><br />
                  Consultez les informations générées et ajoutez ou modifiez si nécessaire.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>4. Générez des CV personnalisés</strong><br />
                  Créez des CV adaptés à des postes spécifiques.
                </span>
              </li>
            </ul>
          </div>
          <PhotoUpload disabled={isGenerating} />
          <DocumentList disabled={isGenerating} />
          
          <GenerateProfileDialog 
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleConfirmGeneration}
            disabled={isGenerating}
          />
          
          <GenerateProfileButton 
            isGenerating={isGenerating} 
            onClick={handleGenerateButtonClick}
          />
        </div>
      </CardContent>
    </Card>
  );
};
