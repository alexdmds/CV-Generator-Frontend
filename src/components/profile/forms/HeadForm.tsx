
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { HeadSection } from "@/types/profile";

interface HeadFormProps {
  initialData: HeadSection;
  onSave: (data: HeadSection) => void;
  lastSavedTime: number;
}

export const HeadForm = ({ 
  initialData, 
  onSave,
  lastSavedTime
}: HeadFormProps) => {
  const form = useForm({
    defaultValues: initialData,
  });
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const lastChangedTimeRef = useRef<number>(0);

  useEffect(() => {
    const subscription = form.watch((value) => {
      lastChangedTimeRef.current = Date.now();
      setSavedFields({});
      onSave(value as HeadSection);
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  useEffect(() => {
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation");
      const fields = Object.keys(form.getValues());
      const newSavedFields: Record<string, boolean> = {};
      fields.forEach(field => {
        newSavedFields[field] = true;
      });
      setSavedFields(newSavedFields);
      
      const timer = setTimeout(() => {
        setSavedFields({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime, form]);

  const savedFieldStyle = `
    transition-all duration-500 
    animate-none
    focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
  `;

  const savedAnimation = `
    border-green-400
    ring-1 ring-green-400/30
    transition-all duration-500
  `;

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: John Doe" 
                  {...field} 
                  className={savedFields.name ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: +33 6 00 00 00 00" 
                  {...field} 
                  className={savedFields.phone ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: john.doe@example.com" 
                  {...field} 
                  className={savedFields.mail ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre professionnel</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Développeur Web Senior" 
                  {...field} 
                  className={savedFields.title ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL LinkedIn</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: https://www.linkedin.com/in/johndoe" 
                  {...field} 
                  className={savedFields.linkedin_url ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
