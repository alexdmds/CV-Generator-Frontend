import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "@/types/profile";
import { getAuth } from "firebase/auth";
import { Save, User, Briefcase, GraduationCap, Brain, Heart, Globe } from "lucide-react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  HeadForm,
  ExperiencesForm,
  EducationForm,
  SkillsForm,
  HobbiesForm,
  LanguagesForm
} from "./forms";

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

export const ProfileView = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(0);
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const originalProfileRef = useRef<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
    };

    fetchProfile();
  }, [auth, toast, db]);

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

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="text-gray-500">Chargement du profil...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="text-gray-500">Aucun profil disponible. Veuillez en générer un.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6">
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
        {hasChanges && (
          <div className="absolute right-4 top-4">
            <Button 
              onClick={saveProfile} 
              disabled={isSaving}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="head" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="head" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="experiences" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Expériences</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Formation</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Compétences</span>
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Langues</span>
            </TabsTrigger>
            <TabsTrigger value="hobbies" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Loisirs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="head">
            <HeadForm 
              initialData={profile.head} 
              onSave={(head) => {
                const updatedProfile = { ...profile, head };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          <TabsContent value="experiences">
            <ExperiencesForm 
              initialData={profile.experiences} 
              onSave={(experiences) => {
                const updatedProfile = { 
                  ...profile, 
                  experiences 
                };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationForm 
              initialData={profile.educations} 
              onSave={(educations) => {
                const updatedProfile = { 
                  ...profile, 
                  educations
                };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsForm 
              initialData={profile.skills} 
              onSave={(skills) => {
                const updatedProfile = { ...profile, skills };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          <TabsContent value="languages">
            <LanguagesForm 
              initialData={profile.languages} 
              onSave={(languages) => {
                const updatedProfile = { ...profile, languages };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          <TabsContent value="hobbies">
            <HobbiesForm 
              initialData={profile.hobbies} 
              onSave={(hobbies) => {
                const updatedProfile = { ...profile, hobbies };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
