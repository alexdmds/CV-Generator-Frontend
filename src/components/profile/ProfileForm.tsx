
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Upload, Camera, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const ProfileForm = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const auth = getAuth();
  
  // Initialisation du storage avec le bon bucket
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

  // Chargement initial de la photo de profil
  useEffect(() => {
    const loadProfilePic = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const photoRef = ref(storage, `${user.uid}/profil/photo.jpg`);
          const url = await getDownloadURL(photoRef);
          setProfilePicUrl(url);
        } catch (error) {
          console.log("Pas de photo de profil existante");
        }
      }
    };

    loadProfilePic();
  }, [auth.currentUser, storage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      
      try {
        const user = auth.currentUser;
        
        if (!user) {
          toast({
            title: "Erreur",
            description: "Vous devez être connecté pour upload une photo.",
            variant: "destructive"
          });
          return;
        }

        const metadata = {
          contentType: file.type,
          customMetadata: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'origin': 'https://auto-cv-creator.lovable.app'
          }
        };

        const storageRef = ref(storage, `${user.uid}/profil/photo.jpg`);
        
        await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log("Upload réussi, URL:", downloadURL);
        setProfilePicUrl(downloadURL);
        
        toast({
          title: "Photo mise à jour",
          description: "Votre photo de profil a été changée avec succès.",
        });

      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        const localUrl = URL.createObjectURL(file);
        setProfilePicUrl(localUrl);
        
        toast({
          title: "Mode hors-ligne",
          description: "La photo est sauvegardée localement.",
        });
      }
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

  const handleDeleteCV = (index: number) => {
    setCvFiles((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "CV supprimé",
      description: "Le document a été supprimé avec succès.",
    });
  };

  const handleGenerateCV = () => {
    toast({
      title: "Génération du profil",
      description: "La génération de votre profil va commencer...",
    });
    // TODO: Implémenter la génération du profil
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={profilePicUrl} 
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
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="mr-2 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCV(index)}
                      className="hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleGenerateCV}
            className="w-full"
            variant="default"
          >
            <FileText className="mr-2" />
            Générer mon profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
