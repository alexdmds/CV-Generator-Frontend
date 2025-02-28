
import { DocumentIcon } from "lucide-react";
import { DocumentList } from "@/components/profile/DocumentList";
import { ProfileSection } from "@/components/profile/ProfileSection";

export const DocumentSection = () => {
  return (
    <ProfileSection title="Documents" icon={<DocumentIcon className="w-5 h-5" />}>
      <DocumentList />
    </ProfileSection>
  );
};
