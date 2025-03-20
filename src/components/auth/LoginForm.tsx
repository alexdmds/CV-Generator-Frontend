
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { EmailLoginForm } from "./EmailLoginForm";
import { SignupForm } from "./SignupForm";
import { VerificationMessage } from "./VerificationMessage";
import { auth } from "./firebase-config";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSuccessfulLogin = (token: string) => {
    localStorage.setItem('firebase_token', token);
    navigate("/profile");
  };

  const handleEmailVerificationSent = () => {
    setVerificationSent(true);
  };

  const toggleSignupMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isSignup ? "Créer un compte" : "Connexion"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {verificationSent ? (
          <VerificationMessage onBack={() => setVerificationSent(false)} />
        ) : (
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="google">
              <div className="space-y-4">
                <GoogleAuthButton className="w-full" />
              </div>
            </TabsContent>
            
            <TabsContent value="email">
              {isSignup ? (
                <SignupForm 
                  onLoginClick={toggleSignupMode}
                  onEmailVerificationSent={handleEmailVerificationSent}
                />
              ) : (
                <EmailLoginForm 
                  onSignupClick={toggleSignupMode}
                  onEmailVerificationSent={handleEmailVerificationSent}
                  onSuccessfulLogin={handleSuccessfulLogin}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
