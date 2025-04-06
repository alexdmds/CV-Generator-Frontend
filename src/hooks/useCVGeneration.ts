
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";

export function useCVGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fonction pour générer le CV après confirmation
  const generateCV = async (cvName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour générer un CV",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      // Marquer le début de la génération
      setIsGenerating(true);

      // Obtenir le jeton Firebase actuel
      const token = await user.getIdToken(true);
      
      // Appel à l'API de génération avec le token Firebase
      const response = await fetch("https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/generate-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ cv_name: cvName }),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      console.log("CV generation successful:", data);
      
      // Générer l'URL du PDF
      const pdfPath = `https://cv-generator-447314.firebasestorage.app/${user.uid}/${cvName}.pdf`;
      setPdfUrl(pdfPath);
      
      toast({
        title: "Succès !",
        description: "Votre CV a été généré avec succès.",
      });
      
      return true;
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du CV",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    pdfUrl,
    generateCV,
  };
}
