
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const useProfileGeneration = (refreshTokens: () => void) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
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
    setConfirmOpen(false);
    
    toast({
      title: "Génération du profil",
      description: "La génération de votre profil a commencé. Cela peut prendre jusqu'à 1 minute 30...",
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
      
      // Rafraîchir le compteur de tokens après une génération réussie
      refreshTokens();
      
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

  return {
    isGenerating,
    confirmOpen,
    setConfirmOpen,
    handleGenerateCV
  };
};
