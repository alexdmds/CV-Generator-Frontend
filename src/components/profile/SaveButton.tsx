
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadString } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { Profile } from "@/types/profile";

interface SaveButtonProps {
  profile: Profile | null;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
}

export const SaveButton = ({ profile, isDirty, setIsDirty }: SaveButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

  // Separate save functions for Firestore and our API
  const saveProfileToFirestore = async () => {
    if (!profile) return;
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder votre profil.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Save experiences
      const expRef = ref(storage, `${user.uid}/profil/exp.json`);
      await uploadString(expRef, JSON.stringify(profile.experiences));
      
      // Save education
      const eduRef = ref(storage, `${user.uid}/profil/edu.json`);
      await uploadString(eduRef, JSON.stringify(profile.education));
      
      // Save skills
      const skillsRef = ref(storage, `${user.uid}/profil/skills.json`);
      await uploadString(skillsRef, JSON.stringify(profile.skills));
      
      // Save hobbies
      const hobbiesRef = ref(storage, `${user.uid}/profil/hobbies.json`);
      await uploadString(hobbiesRef, JSON.stringify(profile.hobbies));
      
      // Save head data
      const headRef = ref(storage, `${user.uid}/profil/head.json`);
      await uploadString(headRef, JSON.stringify(profile.head));

      return true;
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      return false;
    }
  };

  const saveProfileToAPI = async () => {
    if (!profile) return false;
    
    try {
      const response = await fetch('https://api.autocvgeneration.com/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile to API');
      }
      
      return true;
    } catch (error) {
      console.error("Error saving to API:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!profile || !isDirty) return;
    
    setIsSaving(true);
    
    try {
      const firestoreResult = await saveProfileToFirestore();
      const apiResult = await saveProfileToAPI();
      
      if (firestoreResult || apiResult) {
        toast({
          title: "Profil sauvegardé",
          description: "Votre profil a été sauvegardé avec succès."
        });
        setIsDirty(false);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder votre profil.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in save operation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-10">
      {isDirty && (
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="shadow-lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
        </Button>
      )}
    </div>
  );
};
