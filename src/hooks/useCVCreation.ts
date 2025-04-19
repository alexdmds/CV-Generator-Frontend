
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from "@/components/auth/firebase-config";
import { doc, collection, setDoc } from "firebase/firestore";

/**
 * Hook for creating a new CV document in Firestore
 */
export function useCVCreation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingJobDescription, setPendingJobDescription] = useState("");
  const [pendingCvId, setPendingCvId] = useState<string | null>(null);
  const [pendingCvName, setPendingCvName] = useState<string | null>(null);
  const { toast } = useToast();

  const createCVDocument = async (jobDescription: string) => {
    setIsSubmitting(true);
    setPendingJobDescription(jobDescription);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un CV",
          variant: "destructive",
        });
        return { success: false };
      }
      
      const cvDocRef = doc(collection(db, "cvs"));
      const cvId = cvDocRef.id;
      
      console.log("Creating new CV document with ID:", cvId);
      
      const defaultCvName = `CV - ${new Date().toLocaleDateString()}`;
      
      await setDoc(cvDocRef, {
        user_id: user.uid,
        cv_id: cvId,
        cv_name: defaultCvName,
        job_raw: jobDescription,
        job_sumup: "",
        creation_date: new Date().toISOString()
      });
      
      console.log("Document CV créé avec succès:", cvId);
      
      setPendingCvId(cvId);
      setPendingCvName(defaultCvName);
      
      return {
        success: true,
        cvId,
        cvName: defaultCvName
      };
      
    } catch (error) {
      console.error("Error creating CV:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du CV",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPendingStates = () => {
    setPendingCvId(null);
    setPendingCvName(null);
    setPendingJobDescription("");
  };

  return {
    isSubmitting,
    pendingJobDescription,
    pendingCvId,
    pendingCvName,
    setPendingCvId,
    setPendingCvName,
    setPendingJobDescription,
    resetPendingStates,
    createCVDocument
  };
}
