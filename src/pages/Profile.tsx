
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import { TokenCounter } from "@/components/profile/TokenCounter";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";

const Profile = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const refreshTokensRef = useRef<() => void>(() => {});

  // Fonction pour actualiser le compteur d'utilisation
  const setRefreshTokensFunction = useCallback((fn: () => void) => {
    refreshTokensRef.current = fn;
  }, []);

  const handleRefreshTokens = useCallback(() => {
    refreshTokensRef.current();
  }, []);

  // Effet pour les logs de débogage et forcer le rafraîchissement
  useEffect(() => {
    console.log("État de génération dans Profile:", isGenerating);
    
    // Forcer la réinitialisation après 2 minutes maximum (en cas de problème)
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isGenerating) {
      timeoutId = setTimeout(() => {
        console.log("Timeout de sécurité atteint, force l'état isGenerating à false");
        setIsGenerating(false);
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isGenerating]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-8">
          <TokenCounter onRefreshRequest={setRefreshTokensFunction} />
        </div>
        <ProfileForm 
          isGenerating={isGenerating} 
          setIsGenerating={setIsGenerating}
          refreshTokens={handleRefreshTokens}
        />
        {!isGenerating && <ProfileView />}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/resumes")}
            className="flex items-center gap-2"
            disabled={isGenerating}
          >
            <FileText className="w-4 h-4" />
            Accéder à mes CVs
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
