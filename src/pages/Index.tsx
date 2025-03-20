
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Bienvenue sur CV Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Créez votre CV professionnel facilement avec notre générateur intelligent.
          </p>
          
          <GoogleAuthButton className="w-full" />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">ou</span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate("/login")} 
            variant="outline" 
            className="w-full"
          >
            Options de connexion avancées
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
