
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PhotoUpload } from "./PhotoUpload";
import { DocumentList } from "./DocumentList";
import { LastGeneration } from "./LastGeneration";
import { TokenCounter } from "./TokenCounter";
import { useProfileGeneration } from "@/hooks/useProfileGeneration";
import { GenerateProfileButton } from "./GenerateProfileButton";
import { GenerateProfileDialog } from "./GenerateProfileDialog";

interface ProfileFormProps {
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  refreshTokens: () => void;
}

export const ProfileForm = ({ isGenerating, setIsGenerating, refreshTokens }: ProfileFormProps) => {
  const { 
    confirmOpen, 
    setConfirmOpen, 
    handleGenerateCV 
  } = useProfileGeneration(refreshTokens);

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
        <LastGeneration />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PhotoUpload />
          <DocumentList />
          
          <GenerateProfileDialog 
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleGenerateCV}
          />
          
          <GenerateProfileButton isGenerating={isGenerating} />
        </div>
      </CardContent>
    </Card>
  );
};
