
import { useState } from "react";
import { Profile } from "@/types/profile";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { deepCopy } from "./profileUtils";

export const useProfileSave = (
  profile: Profile | null,
  setOriginalProfile: (profile: Profile) => void,
  setHasChanges: (hasChanges: boolean) => void,
  setLastSavedTime: (time: number) => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();

  const saveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      try {
        // Changement principal: utilisation de la collection "profiles" au lieu de "users"
        const profileDocRef = doc(db, "profiles", user.uid);
        await setDoc(profileDocRef, profile);
        console.log("Profil mis à jour dans Firestore dans la collection profiles");
        
        setOriginalProfile(deepCopy(profile));
        
        setHasChanges(false);
        
        setLastSavedTime(Date.now());
        
        toast({
          title: "Profil sauvegardé",
          description: "Vos modifications ont été enregistrées avec succès.",
        });
      } catch (firestoreError) {
        console.error("Erreur lors de la sauvegarde dans Firestore:", firestoreError);
        toast({
          variant: "destructive",
          title: "Erreur lors de la sauvegarde",
          description: "Vos modifications n'ont pas pu être enregistrées. Veuillez réessayer.",
        });
        setIsSaving(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/update-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          console.error("Erreur API:", response.status);
          throw new Error(`Erreur lors de la sauvegarde sur l'API: ${response.status}`);
        }
        
        console.log("Profil mis à jour avec succès sur l'API");
      } catch (apiError) {
        console.error("Erreur lors de la sauvegarde sur l'API:", apiError);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: "Impossible d'enregistrer les modifications. Veuillez réessayer.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveProfile
  };
};
