
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { Profile } from "@/types/profile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { SkillsSection } from "@/components/profile/SkillsSection";
import { HobbiesSection } from "@/components/profile/HobbiesSection";
import { DocumentSection } from "@/components/profile/DocumentSection";
import { SaveButton } from "@/components/profile/SaveButton";

export const ProfileView = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileData: Profile = {
          head: { name: "", phone: "", email: "", general_title: "" },
          experiences: { experiences: [] },
          education: { educations: [] },
          skills: { description: "" },
          hobbies: { description: "" }
        };

        // Load head data
        try {
          const headRef = ref(storage, `${user.uid}/profil/head.json`);
          const headUrl = await getDownloadURL(headRef);
          const headResponse = await fetch(headUrl);
          profileData.head = await headResponse.json();
        } catch (error) {
          console.log("No head data");
        }

        // Load experiences
        try {
          const expRef = ref(storage, `${user.uid}/profil/exp.json`);
          const expUrl = await getDownloadURL(expRef);
          const expResponse = await fetch(expUrl);
          profileData.experiences = await expResponse.json();
        } catch (error) {
          console.log("No experiences data");
        }

        // Load education
        try {
          const eduRef = ref(storage, `${user.uid}/profil/edu.json`);
          const eduUrl = await getDownloadURL(eduRef);
          const eduResponse = await fetch(eduUrl);
          profileData.education = await eduResponse.json();
        } catch (error) {
          console.log("No education data");
        }

        // Load skills
        try {
          const skillsRef = ref(storage, `${user.uid}/profil/skills.json`);
          const skillsUrl = await getDownloadURL(skillsRef);
          const skillsResponse = await fetch(skillsUrl);
          profileData.skills = await skillsResponse.json();
        } catch (error) {
          console.log("No skills data");
        }

        // Load hobbies
        try {
          const hobbiesRef = ref(storage, `${user.uid}/profil/hobbies.json`);
          const hobbiesUrl = await getDownloadURL(hobbiesRef);
          const hobbiesResponse = await fetch(hobbiesUrl);
          profileData.hobbies = await hobbiesResponse.json();
        } catch (error) {
          console.log("No hobbies data");
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Listen for profile changes from the form component
    const handleProfileChange = (event: CustomEvent) => {
      const updatedProfile = event.detail;
      setProfile(updatedProfile);
      setIsDirty(true);
    };

    window.addEventListener('profileUpdated', handleProfileChange as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileChange as EventListener);
    };
  }, [auth.currentUser]);

  if (loading) {
    return (
      <div className="mt-10 max-w-3xl mx-auto flex justify-center">
        <div className="w-12 h-12 border-4 border-t-purple-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mt-10 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-600">
          Aucun profil trouvé. Complétez le formulaire pour créer votre profil.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <ProfileHeader profile={profile} />

      <ExperienceSection experiences={profile.experiences.experiences} />
      <EducationSection educations={profile.education.educations} />
      <SkillsSection skills={profile.skills.description} />
      <HobbiesSection hobbies={profile.hobbies.description} />
      <DocumentSection />
      
      <SaveButton 
        profile={profile} 
        isDirty={isDirty} 
        setIsDirty={setIsDirty} 
      />
    </div>
  );
};
