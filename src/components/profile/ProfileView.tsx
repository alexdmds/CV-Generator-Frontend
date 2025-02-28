
import { useState, useEffect } from "react";
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
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();

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
            setProfile(userDoc.data().cv_data as Profile);
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
            setIsLoading(false);
            return;
          }
          throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();
        console.log("Profil récupéré depuis l'API:", data);
        setProfile(data);
        
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [auth, toast, db]);

  const saveProfile = async (updatedProfile: Profile) => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Sauvegarder dans l'API
      const token = await user.getIdToken();
      const response = await fetch(`https://cv-generator-api-prod-177360827241.europe-west1.run.app/api/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      // Sauvegarder également dans Firestore sous la clé "cv_data"
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { cv_data: updatedProfile }, { merge: true });
      console.log("Profil mis à jour dans Firestore sous cv_data");

      toast({
        title: "Profil enregistré",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
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
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
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
                saveProfile(updatedProfile);
              }} 
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
                saveProfile(updatedProfile);
              }} 
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
                saveProfile(updatedProfile);
              }} 
            />
          </TabsContent>

          {/* Compétences */}
          <TabsContent value="skills">
            <SkillsForm 
              initialData={profile.skills} 
              onSave={(skills) => {
                const updatedProfile = { ...profile, skills };
                setProfile(updatedProfile);
                saveProfile(updatedProfile);
              }} 
            />
          </TabsContent>

          {/* Loisirs */}
          <TabsContent value="hobbies">
            <HobbiesForm 
              initialData={profile.hobbies} 
              onSave={(hobbies) => {
                const updatedProfile = { ...profile, hobbies };
                setProfile(updatedProfile);
                saveProfile(updatedProfile);
              }} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Formulaire pour les informations générales
const HeadForm = ({ initialData, onSave }: { 
  initialData: Profile['head'], 
  onSave: (data: Profile['head']) => void 
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (data: Profile['head']) => {
    setIsSaving(true);
    onSave(data);
    setIsSaving(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: John Doe" {...field} />
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
                <Input placeholder="Ex: +33 6 00 00 00 00" {...field} />
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
                <Input placeholder="Ex: john.doe@example.com" {...field} />
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
                <Input placeholder="Ex: Développeur Web Senior" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
};

// Formulaire pour les expériences
const ExperiencesForm = ({ initialData, onSave }: { 
  initialData: Profile['experiences']['experiences'], 
  onSave: (data: Profile['experiences']['experiences']) => void 
}) => {
  const [experiences, setExperiences] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    onSave(experiences);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {experiences.map((experience, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4">
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entreprise</label>
              <Input 
                value={experience.company} 
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Ex: Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lieu</label>
              <Input 
                value={experience.location} 
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                placeholder="Ex: Paris, France"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={experience.dates} 
                onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                placeholder="Ex: Janvier 2020 - Présent"
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
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
};

// Formulaire pour la formation
const EducationForm = ({ initialData, onSave }: { 
  initialData: Profile['education']['educations'], 
  onSave: (data: Profile['education']['educations']) => void 
}) => {
  const [educations, setEducations] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    onSave(educations);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {educations.map((education, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4">
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Établissement</label>
              <Input 
                value={education.etablissement} 
                onChange={(e) => updateEducation(index, 'etablissement', e.target.value)}
                placeholder="Ex: Université Paris Saclay"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={education.dates} 
                onChange={(e) => updateEducation(index, 'dates', e.target.value)}
                placeholder="Ex: 2015 - 2017"
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
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
};

// Formulaire pour les compétences
const SkillsForm = ({ initialData, onSave }: { 
  initialData: Profile['skills'], 
  onSave: (data: Profile['skills']) => void 
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (data: Profile['skills']) => {
    setIsSaving(true);
    onSave(data);
    setIsSaving(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
};

// Formulaire pour les loisirs
const HobbiesForm = ({ initialData, onSave }: { 
  initialData: Profile['hobbies'], 
  onSave: (data: Profile['hobbies']) => void 
}) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (data: Profile['hobbies']) => {
    setIsSaving(true);
    onSave(data);
    setIsSaving(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
};
