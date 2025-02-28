
import { ReactNode } from "react";

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const ProfileSection = ({ title, children, icon }: ProfileSectionProps) => {
  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};
