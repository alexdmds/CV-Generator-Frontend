
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "@/types/profile";
import { getAuth } from "firebase/auth";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, User, Briefcase, GraduationCap, Brain, Heart, Save } from "lucide-react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const emptyProfile: Profile = {
  head: {
    name: "",
    phone: "",
    email: "",
    general_title: "",
  },
  experiences: {
    experiences: []
  },
  education: {
    educations: []
  },
  skills: {
    description: ""
  },
  hobbies: {
    description: ""
  }
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

        // Tenter de récupérer le profil depuis Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        console.log("Document Firestore récupéré:", userDoc.exists() ? "Document existe" : "Document n'existe pas");
        
        if (userDoc.exists()) {
          console.log("Contenu du document Firestore:", userDoc.data());
          
          // Vérifie si le document contient la clé "cv_data"
          if (userDoc.data().cv_data) {
            // Profil trouvé dans Firestore sous la clé "cv_data"
            console.log("Profil récupéré depuis Firestore (cv_data):", userDoc.data().cv_data);
            const loadedProfile = userDoc.data().cv_data as Profile;
            setProfile(loadedProfile);
            originalProfileRef.current = JSON.parse(JSON.stringify(loadedProfile)); // Copie profonde pour la comparaison
            setIsLoading(false);
            return;
          } else {
            console.log("Le document existe mais ne contient pas la clé 'cv_data'");
          }
        }

        // Si non trouvé dans Firestore, essayer l'API
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
        
        // Sauvegarder le profil dans Firestore pour un accès futur
        try {
          // Sauvegarde le profil sous la clé "cv_data"
          await setDoc(userDocRef, { cv_data: data }, { merge: true });
          console.log("Profil sauvegardé dans Firestore sous cv_data");
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
        // En cas d'erreur, on essaie quand même d'afficher un profil vide
        setProfile(emptyProfile);
        originalProfileRef.current = JSON.parse(JSON.stringify(emptyProfile));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [auth, toast, db]);

  // Fonction pour vérifier si le profil a changé
  const checkForChanges = useCallback((updatedProfile: Profile) => {
    if (!originalProfileRef.current) return false;
    
    // Comparaison stricte pour détecter les changements
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

      // Sauvegarder dans Firestore
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { cv_data: profile }, { merge: true });
        console.log("Profil mis à jour dans Firestore sous cv_data");
        
        // Mettre à jour la référence du profil original après sauvegarde
        originalProfileRef.current = JSON.parse(JSON.stringify(profile));
        
        // Marquer l'absence de changements
        setHasChanges(false);
        
        // Marquer l'heure de la dernière sauvegarde
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

      // Essayer de sauvegarder dans l'API
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
        // Ne pas faire échouer la sauvegarde juste parce que l'API a échoué
        // Les données sont déjà dans Firestore
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
          <TabsList className="grid grid-cols-5 mb-6">
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
            <TabsTrigger value="hobbies" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Loisirs</span>
            </TabsTrigger>
          </TabsList>

          {/* Informations Générales */}
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

          {/* Expériences */}
          <TabsContent value="experiences">
            <ExperiencesForm 
              initialData={profile.experiences.experiences} 
              onSave={(experiences) => {
                const updatedProfile = { 
                  ...profile, 
                  experiences: { experiences } 
                };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          {/* Formation */}
          <TabsContent value="education">
            <EducationForm 
              initialData={profile.education.educations} 
              onSave={(educations) => {
                const updatedProfile = { 
                  ...profile, 
                  education: { educations } 
                };
                setProfile(updatedProfile);
                checkForChanges(updatedProfile);
              }}
              lastSavedTime={lastSavedTime}
            />
          </TabsContent>

          {/* Compétences */}
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

          {/* Loisirs */}
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

// Définition d'un effet de sauvegarde personnalisé CSS
// Effet visuel lorsque la sauvegarde est complète
const savedFieldStyle = `
  transition-all duration-500 
  animate-none
  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
`;

// Effet d'animation pour montrer que le champ a été sauvegardé
const savedAnimation = `
  border-green-400
  ring-1 ring-green-400/30
  transition-all duration-500
`;

// Formulaire pour les informations générales
const HeadForm = ({ 
  initialData, 
  onSave,
  lastSavedTime
}: { 
  initialData: Profile['head'], 
  onSave: (data: Profile['head']) => void,
  lastSavedTime: number
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const lastChangedTimeRef = useRef<number>(0);

  // Observer pour détecter les changements de champ
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Marquer l'heure du dernier changement
      lastChangedTimeRef.current = Date.now();
      // Réinitialiser l'état des champs sauvegardés lorsqu'un champ est modifié
      setSavedFields({});
      onSave(value as Profile['head']);
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  // Effet pour montrer l'animation de sauvegarde
  useEffect(() => {
    // Seulement si une sauvegarde a eu lieu et après un changement
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation");
      // Marquer tous les champs comme sauvegardés
      const fields = Object.keys(form.getValues());
      const newSavedFields: Record<string, boolean> = {};
      fields.forEach(field => {
        newSavedFields[field] = true;
      });
      setSavedFields(newSavedFields);
      
      // Réinitialiser l'effet après 1.5 secondes
      const timer = setTimeout(() => {
        setSavedFields({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: John Doe" 
                  {...field} 
                  className={savedFields.name ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: +33 6 00 00 00 00" 
                  {...field} 
                  className={savedFields.phone ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: john.doe@example.com" 
                  {...field} 
                  className={savedFields.email ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="general_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre professionnel</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Développeur Web Senior" 
                  {...field} 
                  className={savedFields.general_title ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

// Formulaire pour les expériences
const ExperiencesForm = ({ 
  initialData, 
  onSave,
  lastSavedTime
}: { 
  initialData: Profile['experiences']['experiences'], 
  onSave: (data: Profile['experiences']['experiences']) => void,
  lastSavedTime: number
}) => {
  const [experiences, setExperiences] = useState(initialData);
  const [savedSections, setSavedSections] = useState<boolean>(false);
  const lastChangedTimeRef = useRef<number>(0);

  // Surveiller les changements
  useEffect(() => {
    // Marquer l'heure du dernier changement
    lastChangedTimeRef.current = Date.now();
    // Réinitialiser l'animation lors d'un changement
    setSavedSections(false);
    onSave(experiences);
  }, [experiences, onSave]);

  // Effet pour montrer l'animation de sauvegarde
  useEffect(() => {
    // Seulement si une sauvegarde a eu lieu et après un changement
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les expériences");
      setSavedSections(true);
      
      // Réinitialiser après 1.5 secondes
      const timer = setTimeout(() => {
        setSavedSections(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime]);

  const addExperience = () => {
    setExperiences([...experiences, {
      post: "",
      company: "",
      location: "",
      dates: "",
      description: ""
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Profile['experiences']['experiences'][0], value: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setExperiences(updatedExperiences);
  };

  return (
    <div className="space-y-6">
      {experiences.map((experience, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-md space-y-4 ${savedSections ? savedAnimation : 'transition-all duration-300'}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Expérience {index + 1}</h3>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeExperience(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Poste</label>
              <Input 
                value={experience.post} 
                onChange={(e) => updateExperience(index, 'post', e.target.value)}
                placeholder="Ex: Développeur Frontend"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entreprise</label>
              <Input 
                value={experience.company} 
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Ex: Acme Inc."
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lieu</label>
              <Input 
                value={experience.location} 
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                placeholder="Ex: Paris, France"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={experience.dates} 
                onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                placeholder="Ex: Janvier 2020 - Présent"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={experience.description} 
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Description des responsabilités et réalisations"
              rows={4}
              className={savedSections ? savedAnimation : savedFieldStyle}
            />
          </div>
          <Separator />
        </div>
      ))}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addExperience}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une expérience
        </Button>
      </div>
    </div>
  );
};

// Formulaire pour la formation
const EducationForm = ({ 
  initialData, 
  onSave,
  lastSavedTime 
}: { 
  initialData: Profile['education']['educations'], 
  onSave: (data: Profile['education']['educations']) => void,
  lastSavedTime: number
}) => {
  const [educations, setEducations] = useState(initialData);
  const [savedSections, setSavedSections] = useState<boolean>(false);
  const lastChangedTimeRef = useRef<number>(0);

  // Surveiller les changements
  useEffect(() => {
    // Marquer l'heure du dernier changement
    lastChangedTimeRef.current = Date.now();
    // Réinitialiser l'animation lors d'un changement
    setSavedSections(false);
    onSave(educations);
  }, [educations, onSave]);

  // Effet pour montrer l'animation de sauvegarde
  useEffect(() => {
    // Seulement si une sauvegarde a eu lieu et après un changement
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les formations");
      setSavedSections(true);
      
      // Réinitialiser après 1.5 secondes
      const timer = setTimeout(() => {
        setSavedSections(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime]);

  const addEducation = () => {
    setEducations([...educations, {
      intitule: "",
      etablissement: "",
      dates: "",
      description: ""
    }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Profile['education']['educations'][0], value: string) => {
    const updatedEducations = [...educations];
    updatedEducations[index] = {
      ...updatedEducations[index],
      [field]: value
    };
    setEducations(updatedEducations);
  };

  return (
    <div className="space-y-6">
      {educations.map((education, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-md space-y-4 ${savedSections ? savedAnimation : 'transition-all duration-300'}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Formation {index + 1}</h3>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeEducation(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intitulé</label>
              <Input 
                value={education.intitule} 
                onChange={(e) => updateEducation(index, 'intitule', e.target.value)}
                placeholder="Ex: Master en Informatique"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Établissement</label>
              <Input 
                value={education.etablissement} 
                onChange={(e) => updateEducation(index, 'etablissement', e.target.value)}
                placeholder="Ex: Université Paris Saclay"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={education.dates} 
                onChange={(e) => updateEducation(index, 'dates', e.target.value)}
                placeholder="Ex: 2015 - 2017"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={education.description} 
              onChange={(e) => updateEducation(index, 'description', e.target.value)}
              placeholder="Description du programme et des acquis"
              rows={4}
              className={savedSections ? savedAnimation : savedFieldStyle}
            />
          </div>
          <Separator />
        </div>
      ))}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addEducation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une formation
        </Button>
      </div>
    </div>
  );
};

// Formulaire pour les compétences
const SkillsForm = ({ 
  initialData, 
  onSave,
  lastSavedTime 
}: { 
  initialData: Profile['skills'], 
  onSave: (data: Profile['skills']) => void,
  lastSavedTime: number 
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const lastChangedTimeRef = useRef<number>(0);

  // Observer pour détecter les changements de champ
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Marquer l'heure du dernier changement
      lastChangedTimeRef.current = Date.now();
      // Réinitialiser l'état des champs sauvegardés lorsqu'un champ est modifié
      setSavedFields({});
      onSave(value as Profile['skills']);
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  // Effet pour montrer l'animation de sauvegarde
  useEffect(() => {
    // Seulement si une sauvegarde a eu lieu et après un changement
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les compétences");
      // Marquer tous les champs comme sauvegardés
      const fields = Object.keys(form.getValues());
      const newSavedFields: Record<string, boolean> = {};
      fields.forEach(field => {
        newSavedFields[field] = true;
      });
      setSavedFields(newSavedFields);
      
      // Réinitialiser l'effet après 1.5 secondes
      const timer = setTimeout(() => {
        setSavedFields({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description des compétences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Listez vos compétences techniques et personnelles"
                  rows={8}
                  {...field} 
                  className={savedFields.description ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

// Formulaire pour les loisirs
const HobbiesForm = ({ 
  initialData, 
  onSave,
  lastSavedTime
}: { 
  initialData: Profile['hobbies'], 
  onSave: (data: Profile['hobbies']) => void,
  lastSavedTime: number
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const lastChangedTimeRef = useRef<number>(0);

  // Observer pour détecter les changements de champ
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Marquer l'heure du dernier changement
      lastChangedTimeRef.current = Date.now();
      // Réinitialiser l'état des champs sauvegardés lorsqu'un champ est modifié
      setSavedFields({});
      onSave(value as Profile['hobbies']);
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  // Effet pour montrer l'animation de sauvegarde
  useEffect(() => {
    // Seulement si une sauvegarde a eu lieu et après un changement
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les loisirs");
      // Marquer tous les champs comme sauvegardés
      const fields = Object.keys(form.getValues());
      const newSavedFields: Record<string, boolean> = {};
      fields.forEach(field => {
        newSavedFields[field] = true;
      });
      setSavedFields(newSavedFields);
      
      // Réinitialiser l'effet après 1.5 secondes
      const timer = setTimeout(() => {
        setSavedFields({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description des loisirs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez vos centres d'intérêt, hobbies et activités"
                  rows={8}
                  {...field} 
                  className={savedFields.description ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
