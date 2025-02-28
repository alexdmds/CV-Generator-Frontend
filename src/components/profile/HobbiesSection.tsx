
import { HeartIcon } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";

interface HobbiesSectionProps {
  hobbies: string;
}

export const HobbiesSection = ({ hobbies }: HobbiesSectionProps) => {
  return (
    <ProfileSection title="Centres d'intérêt" icon={<HeartIcon className="w-5 h-5" />}>
      {hobbies ? (
        <p className="text-gray-600 whitespace-pre-line">{hobbies}</p>
      ) : (
        <p className="text-gray-500 italic">Aucun centre d'intérêt ajouté</p>
      )}
    </ProfileSection>
  );
};
