
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileLoadingState } from "./ProfileLoadingState";
import { ProfileEmptyState } from "./ProfileEmptyState";
import { useProfileData } from "@/hooks/profile";

export const ProfileView = () => {
  const {
    profile,
    setProfile,
    isLoading,
    isSaving,
    hasChanges,
    lastSavedTime,
    checkForChanges,
    saveProfile
  } = useProfileData();

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (!profile) {
    return <ProfileEmptyState />;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6">
      <ProfileHeader 
        hasChanges={hasChanges} 
        isSaving={isSaving} 
        onSave={saveProfile} 
      />
      <CardContent>
        <ProfileTabs
          profile={profile}
          onProfileUpdate={setProfile}
          checkForChanges={checkForChanges}
          lastSavedTime={lastSavedTime}
        />
      </CardContent>
    </Card>
  );
};
