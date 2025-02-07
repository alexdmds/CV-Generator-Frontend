import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProfileForm = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
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
              <AvatarImage src={profilePic ? URL.createObjectURL(profilePic) : ""} />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
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
          <Button type="submit" className="w-full">
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};