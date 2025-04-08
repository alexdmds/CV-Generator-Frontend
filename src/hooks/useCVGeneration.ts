
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/components/auth/firebase-config";
import { generateCVApi, checkExistingCV } from "@/utils/apiService";

export function useCVGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to check if a CV already exists and display it
  const checkExistingCVAndDisplay = async (cvName: string, showToast = true) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour accéder aux CVs",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      }

      // Set checking state
      setIsChecking(true);
      
      console.log(`Checking for existing CV: ${cvName}`);

      // Add timeout to the whole operation
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Vérification du CV existant a expiré"));
        }, 10000); // 10 second timeout
      });

      // Check if CV already exists
      const checkPromise = new Promise<boolean>(async (resolve) => {
        try {
          const existingPdfUrl = await checkExistingCV(user, cvName);
          
          if (existingPdfUrl) {
            setPdfUrl(existingPdfUrl);
            if (showToast) {
              toast({
                title: "CV trouvé",
                description: "Le CV existe déjà et a été chargé",
              });
            }
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error("Error in checkPromise:", error);
          resolve(false);
        }
      });

      // Race between the check operation and timeout
      try {
        return await Promise.race([checkPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error("Checking for existing CV timed out:", timeoutError);
        if (showToast) {
          toast({
            title: "Recherche expirée",
            description: "La recherche du CV existant a pris trop de temps",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error checking for existing CV:", error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

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

      // First check if CV already exists
      const exists = await checkExistingCVAndDisplay(cvName);
      if (exists) {
        return true;
      }

      // Marquer le début de la génération
      setIsGenerating(true);

      // Appel à l'API de génération via notre service
      const result = await generateCVApi(user, cvName);

      if (result.success && result.pdfPath) {
        setPdfUrl(result.pdfPath);
        
        toast({
          title: "Succès !",
          description: "Votre CV a été généré avec succès.",
        });
        
        return true;
      } else {
        throw new Error(result.message || "Échec de la génération du CV");
      }
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
    isChecking,
    pdfUrl,
    generateCV,
    checkExistingCVAndDisplay
  };
}
