
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import { Education } from "@/types/profile";

interface EducationFormProps {
  initialData: Education[];
  onSave: (data: Education[]) => void;
  lastSavedTime: number;
}

export const EducationForm = ({ 
  initialData, 
  onSave,
  lastSavedTime 
}: EducationFormProps) => {
  const [educations, setEducations] = useState(initialData);
  const [savedSections, setSavedSections] = useState<boolean>(false);
  const lastChangedTimeRef = useRef<number>(0);

  useEffect(() => {
    lastChangedTimeRef.current = Date.now();
    setSavedSections(false);
    onSave(educations);
  }, [educations, onSave]);

  useEffect(() => {
    if (lastSavedTime > 0 && lastSavedTime > lastChangedTimeRef.current) {
      console.log("Sauvegarde détectée, affichage de l'animation pour les formations");
      setSavedSections(true);
      
      const timer = setTimeout(() => {
        setSavedSections(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [lastSavedTime]);

  const addEducation = () => {
    setEducations([...educations, {
      title: "",
      university: "",
      dates: "",
      full_description: ""
    }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedEducations = [...educations];
    updatedEducations[index] = {
      ...updatedEducations[index],
      [field]: value
    };
    setEducations(updatedEducations);
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
      {educations.map((education, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-md space-y-4 ${savedSections ? savedAnimation : 'transition-all duration-300'}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Formation {index + 1}</h3>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeEducation(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intitulé</label>
              <Input 
                value={education.title} 
                onChange={(e) => updateEducation(index, 'title', e.target.value)}
                placeholder="Ex: Master en Informatique"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Établissement</label>
              <Input 
                value={education.university} 
                onChange={(e) => updateEducation(index, 'university', e.target.value)}
                placeholder="Ex: Université Paris Saclay"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dates</label>
              <Input 
                value={education.dates} 
                onChange={(e) => updateEducation(index, 'dates', e.target.value)}
                placeholder="Ex: 2015 - 2017"
                className={savedSections ? savedAnimation : savedFieldStyle}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={education.full_description} 
              onChange={(e) => updateEducation(index, 'full_description', e.target.value)}
              placeholder="Description du programme et des acquis"
              rows={4}
              className={savedSections ? savedAnimation : savedFieldStyle}
            />
          </div>
          <Separator />
        </div>
      ))}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addEducation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une formation
        </Button>
      </div>
    </div>
  );
};
