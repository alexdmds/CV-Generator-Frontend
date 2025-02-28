
import { Profile } from "@/types/profile";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { LastGeneration } from "@/components/profile/LastGeneration";

interface ProfileHeaderProps {
  profile: Profile | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
      <div className="flex-shrink-0">
        <PhotoUpload />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-800">
          {profile?.head?.name || "Votre profil"}
        </h2>
        <p className="text-gray-600 text-lg">
          {profile?.head?.general_title || "Complétez votre profil pour générer votre CV"}
        </p>
        <LastGeneration />
      </div>
    </div>
  );
};
