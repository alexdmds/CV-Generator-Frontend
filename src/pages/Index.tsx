
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { ArrowDown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center">
            CV Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Créez votre CV professionnel facilement avec notre générateur intelligent.
          </p>
          
          <GoogleAuthButton className="w-full" />
          
          <div className="flex flex-col items-center pt-2">
            <Button 
              onClick={() => navigate("/login")} 
              variant="ghost" 
              size="sm"
              className="text-xs text-gray-500 flex items-center gap-1"
            >
              <ArrowDown className="h-3 w-3" />
              Options de connexion alternatives
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
