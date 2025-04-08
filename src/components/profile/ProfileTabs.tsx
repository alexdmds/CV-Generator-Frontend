
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, GraduationCap, Brain, Heart, Globe } from "lucide-react";
import { Profile } from "@/types/profile";
import {
  HeadForm,
  ExperiencesForm,
  EducationForm,
  SkillsForm,
  HobbiesForm,
  LanguagesForm
} from "./forms";

interface ProfileTabsProps {
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
  checkForChanges: (updatedProfile: Profile) => boolean;
  lastSavedTime: number;
}

export const ProfileTabs = ({ 
  profile, 
  onProfileUpdate, 
  checkForChanges, 
  lastSavedTime 
}: ProfileTabsProps) => {
  return (
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
            onProfileUpdate(updatedProfile);
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
            onProfileUpdate(updatedProfile);
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
            onProfileUpdate(updatedProfile);
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
            onProfileUpdate(updatedProfile);
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
            onProfileUpdate(updatedProfile);
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
            onProfileUpdate(updatedProfile);
            checkForChanges(updatedProfile);
          }}
          lastSavedTime={lastSavedTime}
        />
      </TabsContent>
    </Tabs>
  );
};
