
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Upload, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ProfileForm = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCvFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: "CV uploadé",
        description: `${newFiles.length} fichier(s) ajouté(s)`,
      });
    }
  };

  const handleGenerateCV = () => {
    toast({
      title: "Génération du CV",
      description: "La génération de votre CV va commencer...",
    });
    // TODO: Implémenter la génération du CV
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={profilePic ? URL.createObjectURL(profilePic) : ""} 
                alt="Photo de profil" 
              />
              <AvatarFallback>
                <Camera className="w-8 h-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-pic"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("profile-pic")?.click()}
            >
              <Camera className="mr-2" />
              Changer la photo
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Titre professionnel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Mes anciens CV</p>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleCvUpload}
              className="hidden"
              id="cv-upload"
              multiple
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("cv-upload")?.click()}
              className="w-full"
            >
              <Upload className="mr-2" />
              Ajouter des CV (PDF)
            </Button>
            
            {cvFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {cvFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 bg-gray-50 rounded-md"
                  >
                    <FileText className="mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleGenerateCV}
              className="w-full"
              variant="secondary"
            >
              <FileText className="mr-2" />
              Générer mon CV
            </Button>

            <Button type="submit" className="w-full">
              Sauvegarder
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
