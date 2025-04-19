
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { getAuth } from "firebase/auth";

interface DocumentListProps {
  disabled?: boolean;
}

export const DocumentList = ({ disabled = false }: DocumentListProps) => {
  const [cvFiles, setCvFiles] = useState<{name: string, url: string}[]>([]);
  const { toast } = useToast();
  const auth = getAuth();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

  useEffect(() => {
    const loadCVs = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const cvFolderRef = ref(storage, `${user.uid}/sources`);
          const filesList = await listAll(cvFolderRef);
          
          const token = await user.getIdToken();
          
          const filesData = await Promise.all(
            filesList.items.map(async (fileRef) => {
              const url = await getDownloadURL(fileRef);
              return {
                name: fileRef.name,
                url: url
              };
            })
          );
          
          setCvFiles(filesData);
        } catch (error) {
          console.log("Pas de documents existants");
        }
      }
    };

    loadCVs();
  }, [auth.currentUser]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour upload des documents.",
          variant: "destructive"
        });
        return;
      }

      const newFiles = Array.from(e.target.files);
      
      try {
        const uploadPromises = newFiles.map(async (file) => {
          const metadata = {
            contentType: file.type,
            customMetadata: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'origin': 'https://auto-cv-creator.lovable.app'
            }
          };

          const storageRef = ref(storage, `${user.uid}/sources/${file.name}`);
          await uploadBytes(storageRef, file, metadata);
          const url = await getDownloadURL(storageRef);
          
          return {
            name: file.name,
            url: url
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        setCvFiles(prev => [...prev, ...uploadedFiles]);

        toast({
          title: "Document uploadé",
          description: `${newFiles.length} fichier(s) ajouté(s)`,
        });
      } catch (error) {
        console.error("Erreur lors de l'upload des documents:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'upload des documents.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteCV = async (index: number) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer des documents.",
        variant: "destructive"
      });
      return;
    }

    const fileToDelete = cvFiles[index];
    try {
      const fileRef = ref(storage, `${user.uid}/sources/${fileToDelete.name}`);
      await deleteObject(fileRef);
      
      setCvFiles(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Mes documents</p>
      <Input
        type="file"
        accept=".pdf"
        onChange={handleCvUpload}
        className="hidden"
        id="cv-upload"
        multiple
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("cv-upload")?.click()}
        className="w-full"
        disabled={disabled}
      >
        <Upload className="mr-2" />
        Ajouter des documents (PDF)
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
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
