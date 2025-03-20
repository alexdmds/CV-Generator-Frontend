
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

// Schéma de validation pour le formulaire d'inscription
const signupSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onLoginClick: () => void;
  onEmailVerificationSent: () => void;
}

export const SignupForm = ({ onLoginClick, onEmailVerificationSent }: SignupFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  // Initialisation du formulaire avec React Hook Form et Zod
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Création de compte
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Envoyer un email de vérification
      await sendEmailVerification(userCredential.user);
      onEmailVerificationSent();
      
      toast({
        title: "Compte créé avec succès",
        description: "Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre email pour accéder à la plateforme.",
      });
      
      // Déconnecter l'utilisateur jusqu'à ce qu'il vérifie son email
      await auth.signOut();
    } catch (error: any) {
      console.error("Erreur:", error);
      
      let errorMessage = "Une erreur est survenue.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cette adresse email est déjà utilisée.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible.";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
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
            onClick={onLoginClick}
          >
            Déjà un compte ? Se connecter
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "S'inscrire"}
        </Button>
      </form>
    </Form>
  );
};
