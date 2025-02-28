
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { TokenCounter } from "@/components/profile/TokenCounter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <ProfileForm 
          isGenerating={isGenerating} 
          setIsGenerating={setIsGenerating} 
        />
        {isGenerating ? (
          <div className="mt-10 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow animate-pulse">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700">Génération du profil en cours...</h3>
            <p className="text-gray-500 mt-2 text-center">
              Veuillez patienter. Cette opération peut prendre jusqu'à 1 minute 30.
              <br />
              Vos données sont en cours de traitement.
            </p>
          </div>
        ) : (
          <div>
            <div className="mt-6 mb-6">
              <TokenCounter />
            </div>
            <ProfileView />
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/resumes")}
            className="flex items-center gap-2"
            disabled={isGenerating}
          >
            <FileText className="w-4 h-4" />
            Accéder à mes CVs
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
