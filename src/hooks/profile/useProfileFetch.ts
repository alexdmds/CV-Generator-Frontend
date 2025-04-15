
import { useState, useCallback } from "react";
import { Profile } from "@/types/profile";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { emptyProfile, deepCopy } from "./profileUtils";

export const useProfileFetch = (
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>,
  setOriginalProfile: (profile: Profile) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      console.log("Tentative de récupération du profil pour l'utilisateur:", user.uid);

      // Changement principal: utilisation de la collection "profiles" au lieu de "users"
      const profileDocRef = doc(db, "profiles", user.uid);
      const profileDoc = await getDoc(profileDocRef);
      
      console.log("Document Firestore récupéré:", profileDoc.exists() ? "Document existe" : "Document n'existe pas");
      
      if (profileDoc.exists()) {
        console.log("Profil récupéré depuis Firestore (collection profiles):", profileDoc.data());
        const loadedProfile = profileDoc.data() as Profile;
        setProfile(loadedProfile);
        setOriginalProfile(deepCopy(loadedProfile));
        setIsLoading(false);
        return;
      }

      // Si aucun profil n'existe dans la collection "profiles", essayer de récupérer de l'API
      console.log("Tentative de récupération du profil depuis l'API");
      const token = await user.getIdToken();
      const response = await fetch(`https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/get-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Réponse de l'API:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Profil non trouvé dans l'API, utilisation d'un profil vide");
          setProfile(emptyProfile);
          setOriginalProfile(deepCopy(emptyProfile));
          setIsLoading(false);
          return;
        }
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profil récupéré depuis l'API:", data);
      setProfile(data);
      setOriginalProfile(deepCopy(data));
      
      try {
        // Sauvegarde dans la collection "profiles"
        await setDoc(profileDocRef, data);
        console.log("Profil sauvegardé dans Firestore dans la collection profiles");
      } catch (firestoreError) {
        console.error("Erreur lors de la sauvegarde dans Firestore:", firestoreError);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger le profil. Veuillez réessayer.",
      });
      setProfile(emptyProfile);
      setOriginalProfile(deepCopy(emptyProfile));
    } finally {
      setIsLoading(false);
    }
  }, [auth, toast, db, navigate, setProfile, setOriginalProfile]);

  return {
    isLoading,
    fetchProfile
  };
};
