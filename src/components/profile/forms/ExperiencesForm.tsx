
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import { Experience } from "@/types/profile";

interface ExperiencesFormProps {
  initialData: Experience[];
  onSave: (data: Experience[]) => void;
  lastSavedTime: number;
}

export const ExperiencesForm = ({ 
  initialData, 
  onSave,
  lastSavedTime
}: ExperiencesFormProps) => {
  const [experiences, setExperiences] = useState(initialData);
  const [savedSections, setSavedSections] = useState<boolean>(false);
  const lastChangedTimeRef = useRef<number>(0);
  const firstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    // Skip the first render to avoid infinite update loops
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    
    lastChangedTimeRef.current = Date.now();
    setSavedSections(false);
    onSave(experiences);
  }, [experiences, onSave]);

  useEffect(() => {
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les expériences");
      setSavedSections(true);
      
      const timer = setTimeout(() => {
        setSavedSections(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime]);

  const addExperience = () => {
    setExperiences([...experiences, {
      title: "",
      company: "",
      location: "",
      dates: "",
      description: ""
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setExperiences(updatedExperiences);
  };

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
    <div className="space-y-6">
      {experiences.map((experience, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-md space-y-4 ${savedSections ? savedAnimation : 'transition-all duration-300'}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Expérience {index + 1}</h3>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeExperience(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Poste</label>
              <Input 
                value={experience.title} 
                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                placeholder="Ex: Développeur Frontend"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entreprise</label>
              <Input 
                value={experience.company} 
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Ex: Acme Inc."
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lieu</label>
              <Input 
                value={experience.location} 
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                placeholder="Ex: Paris, France"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={experience.dates} 
                onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                placeholder="Ex: Janvier 2020 - Présent"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={experience.description} 
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Description des responsabilités et réalisations"
              rows={4}
              className={savedSections ? savedAnimation : savedFieldStyle}
            />
          </div>
          <Separator />
        </div>
      ))}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addExperience}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une expérience
        </Button>
      </div>
    </div>
  );
};
