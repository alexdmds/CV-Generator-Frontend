
import { WrenchIcon } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";

interface SkillsSectionProps {
  skills: string;
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => {
  return (
    <ProfileSection title="Compétences" icon={<WrenchIcon className="w-5 h-5" />}>
      {skills ? (
        <p className="text-gray-600 whitespace-pre-line">{skills}</p>
      ) : (
        <p className="text-gray-500 italic">Aucune compétence ajoutée</p>
      )}
    </ProfileSection>
  );
};
