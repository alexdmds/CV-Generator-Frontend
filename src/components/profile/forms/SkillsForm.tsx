
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface SkillsFormProps {
  initialData: string;
  onSave: (data: string) => void;
  lastSavedTime: number;
}

export const SkillsForm = ({ 
  initialData, 
  onSave,
  lastSavedTime 
}: SkillsFormProps) => {
  const form = useForm({
    defaultValues: { description: initialData },
  });
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const lastChangedTimeRef = useRef<number>(0);

  useEffect(() => {
    const subscription = form.watch((value) => {
      lastChangedTimeRef.current = Date.now();
      setSavedFields({});
      onSave(value.description);
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  useEffect(() => {
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les compétences");
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description des compétences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Listez vos compétences techniques et personnelles"
                  rows={8}
                  {...field} 
                  className={savedFields.description ? savedAnimation : savedFieldStyle}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
