
import { useState, useEffect, useRef, useCallback } from "react";
import { Profile } from "@/types/profile";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const emptyProfile: Profile = {
  head: {
    name: "",
    phone: "",
    mail: "",
    title: "",
    linkedin_url: ""
  },
  experiences: [],
  educations: [],
  skills: "",
  hobbies: "",
  languages: ""
};

export const useProfileData = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(0);
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const originalProfileRef = useRef<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      console.log("Tentative de récupération du profil pour l'utilisateur:", user.uid);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log("Document Firestore récupéré:", userDoc.exists() ? "Document existe" : "Document n'existe pas");
      
      if (userDoc.exists()) {
        console.log("Contenu du document Firestore:", userDoc.data());
        
        if (userDoc.data().profile) {
          console.log("Profil récupéré depuis Firestore (profile):", userDoc.data().profile);
          const loadedProfile = userDoc.data().profile as Profile;
          setProfile(loadedProfile);
          originalProfileRef.current = JSON.parse(JSON.stringify(loadedProfile)); // Copie profonde pour la comparaison
          setIsLoading(false);
          return;
        } else {
          console.log("Le document existe mais ne contient pas la clé 'profile'");
        }
      }

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
          originalProfileRef.current = JSON.parse(JSON.stringify(emptyProfile));
          setIsLoading(false);
          return;
        }
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profil récupéré depuis l'API:", data);
      setProfile(data);
      originalProfileRef.current = JSON.parse(JSON.stringify(data));
      
      try {
        await setDoc(userDocRef, { profile: data }, { merge: true });
        console.log("Profil sauvegardé dans Firestore sous profile");
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
      originalProfileRef.current = JSON.parse(JSON.stringify(emptyProfile));
    } finally {
      setIsLoading(false);
    }
  }, [auth, toast, db]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const checkForChanges = useCallback((updatedProfile: Profile) => {
    if (!originalProfileRef.current) return false;
    
    const hasChanged = JSON.stringify(updatedProfile) !== JSON.stringify(originalProfileRef.current);
    setHasChanges(hasChanged);
    return hasChanged;
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { profile: profile }, { merge: true });
        console.log("Profil mis à jour dans Firestore sous profile");
        
        originalProfileRef.current = JSON.parse(JSON.stringify(profile));
        
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
    profile,
    setProfile,
    isLoading,
    isSaving,
    hasChanges,
    lastSavedTime,
    checkForChanges,
    saveProfile
  };
};
