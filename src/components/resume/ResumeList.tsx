
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { FileText, PlusCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, listAll, uploadString } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const ResumeList = () => {
  const [resumes, setResumes] = useState<string[]>([]);
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
            // Create initial placeholder file to initialize the cvs folder
            const placeholderPath = `${user.uid}/cvs/placeholder.txt`;
            const placeholderRef = ref(storage, placeholderPath);
            await uploadString(placeholderRef, "placeholder content");
          }
          
          setResumes(resumeNames);
        } catch (listError) {
          console.error("Error listing CVs:", listError);
          // Initialize the cvs folder with a placeholder
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
    <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Mes CV</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mes CVs
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {resumes.length === 0 ? (
              <DropdownMenuItem onClick={() => handleResumeClick()}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer mon premier CV
              </DropdownMenuItem>
            ) : (
              <>
                {resumes.map((resume) => (
                  <DropdownMenuItem
                    key={resume}
                    onClick={() => handleResumeClick(resume)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {resume}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => handleResumeClick()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nouveau CV
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleResumeClick(resume)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                  <div>
                    <h3 className="font-medium">{resume}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
