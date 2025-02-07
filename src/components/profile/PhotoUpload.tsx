
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const PhotoUpload = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const { toast } = useToast();
  const auth = getAuth();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

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

  useEffect(() => {
    loadProfilePic();
  }, [auth.currentUser]);

  return (
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
    </div>
  );
};
