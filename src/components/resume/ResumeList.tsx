import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { FileText, PlusCircle, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, listAll, uploadString, deleteObject, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ResumeList = () => {
  const [resumes, setResumes] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [cvToRename, setCvToRename] = useState<string | null>(null);
  const [newCvName, setNewCvName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');
  const auth = getAuth();

  const handleResumeClick = async (resumeId?: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour accéder à vos CVs",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (resumeId) {
      navigate(`/resumes/${resumeId}`);
    } else {
      const newCvName = `CV_${Date.now()}`;
      try {
        const placeholderPath = `${user.uid}/cvs/${newCvName}/placeholder.txt`;
        const placeholderRef = ref(storage, placeholderPath);
        await uploadString(placeholderRef, "placeholder content");
        
        toast({
          title: "Création d'un nouveau CV",
          description: "Votre nouveau CV a été créé",
        });
        navigate(`/resumes/${newCvName}`);
      } catch (error) {
        console.error("Error creating new CV:", error);
        toast({
          title: "Erreur",
          description: "Impossible de créer un nouveau CV",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCV = async () => {
    if (!cvToDelete) return;
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour supprimer un CV",
        variant: "destructive",
      });
      return;
    }

    try {
      const cvFolderRef = ref(storage, `${user.uid}/cvs/${cvToDelete}`);
      const files = await listAll(cvFolderRef);
      
      // Supprimer tous les fichiers dans le dossier
      await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
      
      setResumes(prev => prev.filter(cv => cv !== cvToDelete));
      toast({
        title: "CV supprimé",
        description: "Le CV a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le CV",
        variant: "destructive",
      });
    }
    
    setDeleteConfirmOpen(false);
    setCvToDelete(null);
  };

  const handleRenameCV = async () => {
    if (!cvToRename || !newCvName) return;
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour renommer un CV",
        variant: "destructive",
      });
      return;
    }

    try {
      const oldPath = `${user.uid}/cvs/${cvToRename}`;
      const newPath = `${user.uid}/cvs/${newCvName}`;
      
      // Pour Firebase Storage, nous devons copier puis supprimer
      const files = await listAll(ref(storage, oldPath));
      
      // Copier tous les fichiers vers le nouveau dossier
      await Promise.all(files.items.map(async (fileRef) => {
        const newFileRef = ref(storage, `${newPath}/${fileRef.name}`);
        const content = await fileRef.getDownloadURL();
        await uploadString(newFileRef, content);
        await deleteObject(fileRef);
      }));
      
      setResumes(prev => prev.map(cv => cv === cvToRename ? newCvName : cv));
      toast({
        title: "CV renommé",
        description: "Le CV a été renommé avec succès",
      });
    } catch (error) {
      console.error("Error renaming CV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de renommer le CV",
        variant: "destructive",
      });
    }
    
    setRenameDialogOpen(false);
    setCvToRename(null);
    setNewCvName("");
  };

  useEffect(() => {
    const loadResumes = async (user: any) => {
      try {
        if (!user) {
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour voir vos CVs",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        console.log("Loading CVs for user:", user.uid);
        const cvFolderRef = ref(storage, `${user.uid}/cvs`);
        
        try {
          const result = await listAll(cvFolderRef);
          console.log("List result:", result);
          
          const resumeNames = result.prefixes.map(prefix => prefix.name);
          console.log("CV folders found:", resumeNames);
          
          if (resumeNames.length === 0) {
            const placeholderPath = `${user.uid}/cvs/placeholder.txt`;
            const placeholderRef = ref(storage, placeholderPath);
            await uploadString(placeholderRef, "placeholder content");
          }
          
          setResumes(resumeNames);
        } catch (listError) {
          console.error("Error listing CVs:", listError);
          const placeholderPath = `${user.uid}/cvs/placeholder.txt`;
          const placeholderRef = ref(storage, placeholderPath);
          await uploadString(placeholderRef, "placeholder content");
          setResumes([]);
        }
      } catch (error) {
        console.error("Error in loadResumes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos CVs",
          variant: "destructive",
        });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed. User:", user?.uid);
      if (user) {
        loadResumes(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [toast, storage, auth, navigate]);

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Mes CV</CardTitle>
          <Button
            onClick={() => handleResumeClick()}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau CV
          </Button>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div 
              className="text-center py-8 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => handleResumeClick()}
            >
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Vous n'avez pas encore de CV. Créez-en un nouveau !</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resumes.map((resume) => (
                <Card 
                  key={resume}
                  className="relative cursor-pointer hover:bg-gray-50 group"
                >
                  <CardContent 
                    className="flex items-center gap-4 p-4"
                    onClick={() => handleResumeClick(resume)}
                  >
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div className="flex-grow">
                      <h3 className="font-medium">{resume}</h3>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCvToRename(resume);
                          setNewCvName(resume);
                          setRenameDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCvToDelete(resume);
                          setDeleteConfirmOpen(true);
                        }}
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce CV ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le CV sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCV} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le CV</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newName">Nouveau nom</Label>
            <Input
              id="newName"
              value={newCvName}
              onChange={(e) => setNewCvName(e.target.value)}
              placeholder="Entrez le nouveau nom"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenameCV}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
