
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Navbar } from "@/components/layout/Navbar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
