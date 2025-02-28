
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
const provider = new GoogleAuthProvider();

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

  // Initialisation du formulaire avec React Hook Form et Zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      console.log("Utilisateur connecté:", result.user);
      
      // Définir le token dans le localStorage
      const token = await result.user.getIdToken();
      localStorage.setItem('firebase_token', token);
      
      navigate("/profile");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let errorMessage = "Une erreur est survenue lors de la connexion.";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "Ce domaine n'est pas autorisé pour la connexion. Veuillez contacter l'administrateur.";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      
      let userCredential;
      if (isSignup) {
        // Création de compte
        userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: "Compte créé avec succès",
          description: "Votre compte a été créé et vous êtes maintenant connecté.",
        });
      } else {
        // Connexion
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      
      // Définir le token dans le localStorage
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebase_token', token);
      
      navigate("/profile");
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
          {isSignup ? "Inscription" : "Connexion"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="google">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                className="w-5 h-5"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Se connecter avec Google
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
