
import { BriefcaseIcon } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Experience } from "@/types/profile";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  if (!experiences || experiences.length === 0) {
    return (
      <ProfileSection title="Expériences professionnelles" icon={<BriefcaseIcon className="w-5 h-5" />}>
        <p className="text-gray-500 italic">Aucune expérience ajoutée</p>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Expériences professionnelles" icon={<BriefcaseIcon className="w-5 h-5" />}>
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="border-l-2 border-purple-200 pl-4 ml-2">
            <div className="flex flex-wrap items-baseline justify-between mb-1">
              <h4 className="text-lg font-medium text-gray-800">{exp.post}</h4>
              <span className="text-sm text-gray-600">{exp.dates}</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between mb-2">
              <p className="text-gray-700">
                {exp.company} {exp.location && `- ${exp.location}`}
              </p>
            </div>
            <p className="text-gray-600 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
};
