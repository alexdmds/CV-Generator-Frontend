
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAuthButton } from "./GoogleAuthButton";

const firebaseConfig = {
  apiKey: "AIzaSyD2ZmZ8y399YYyvUHWaKOux3tgAV4T6OLg",
  authDomain: "cv-generator-447314.firebaseapp.com",
  databaseURL: "https://cv-generator-447314-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cv-generator-447314",
  storageBucket: "cv-generator-447314.appspot.com",
  messagingSenderId: "177360827241",
  appId: "1:177360827241:web:2eccbab9c11777f27203f8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Initialisation du formulaire avec React Hook Form et Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      if (isSignup) {
        // Création de compte
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // Envoyer un email de vérification
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        
        toast({
          title: "Compte créé avec succès",
          description: "Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre email pour accéder à la plateforme.",
        });
        
        // Déconnecter l'utilisateur jusqu'à ce qu'il vérifie son email
        await auth.signOut();
      } else {
        // Connexion
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        
        // Vérifier si l'email est vérifié
        if (!userCredential.user.emailVerified) {
          // Envoyer un nouvel email de vérification
          await sendEmailVerification(userCredential.user);
          setVerificationSent(true);
          
          toast({
            title: "Vérification requise",
            description: "Votre email n'est pas vérifié. Un nouvel email de vérification a été envoyé.",
          });
          
          // Déconnecter l'utilisateur jusqu'à ce qu'il vérifie son email
          await auth.signOut();
          return;
        }
        
        // Définir le token dans le localStorage
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('firebase_token', token);
        
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      
      let errorMessage = "Une erreur est survenue.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cette adresse email est déjà utilisée.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email ou mot de passe incorrect.";
      }
      
      toast({
        variant: "destructive",
        title: isSignup ? "Erreur d'inscription" : "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="text-center space-y-4">
            <div className="text-lg font-medium">Email de vérification envoyé</div>
            <p className="text-muted-foreground">
              Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.
            </p>
            <Button
              onClick={() => setVerificationSent(false)}
              variant="outline"
              className="mt-4"
            >
              Retour à la connexion
            </Button>
          </div>
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="●●●●●●" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setIsSignup(!isSignup)}
                    >
                      {isSignup ? "Déjà un compte ? Se connecter" : "Créer un compte"}
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : (isSignup ? "S'inscrire" : "Se connecter")}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
