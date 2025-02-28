
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Mon Profil</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ProfileForm 
            isGenerating={isGenerating} 
            setIsGenerating={setIsGenerating} 
          />
        </div>
        
        {isGenerating ? (
          <div className="mt-10 flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tokens disponibles</h2>
              <TokenCounter />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileView />
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/resumes")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
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
