
import { GraduationCapIcon } from "lucide-react";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Education } from "@/types/profile";

interface EducationSectionProps {
  educations: Education[];
}

export const EducationSection = ({ educations }: EducationSectionProps) => {
  if (!educations || educations.length === 0) {
    return (
      <ProfileSection title="Formation" icon={<GraduationCapIcon className="w-5 h-5" />}>
        <p className="text-gray-500 italic">Aucune formation ajoutée</p>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Formation" icon={<GraduationCapIcon className="w-5 h-5" />}>
      <div className="space-y-4">
        {educations.map((edu, index) => (
          <div key={index} className="border-l-2 border-purple-200 pl-4 ml-2">
            <div className="flex flex-wrap items-baseline justify-between mb-1">
              <h4 className="text-lg font-medium text-gray-800">
                {edu.intitule}
              </h4>
              <span className="text-sm text-gray-600">{edu.dates}</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between mb-2">
              <p className="text-gray-700">{edu.etablissement}</p>
            </div>
            <p className="text-gray-600 whitespace-pre-line">
              {edu.description}
            </p>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
};
