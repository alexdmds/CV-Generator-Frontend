
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface EmailLoginFormProps {
  onSignupClick: () => void;
  onEmailVerificationSent: () => void;
  onSuccessfulLogin: (token: string) => void;
}

export const EmailLoginForm = ({ 
  onSignupClick, 
  onEmailVerificationSent,
  onSuccessfulLogin
}: EmailLoginFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

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
      
      // Connexion
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Vérifier si l'email est vérifié
      if (!userCredential.user.emailVerified) {
        // Envoyer un nouvel email de vérification
        await sendEmailVerification(userCredential.user);
        onEmailVerificationSent();
        
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
      onSuccessfulLogin(token);
    } catch (error: any) {
      console.error("Erreur:", error);
      
      let errorMessage = "Une erreur est survenue.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email ou mot de passe incorrect.";
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

  return (
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
            onClick={onSignupClick}
          >
            Créer un compte
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "Se connecter"}
        </Button>
      </form>
    </Form>
  );
};
