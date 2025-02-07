
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

export const ResumeList = () => {
  const [resumes, setResumes] = useState<string[]>([]);
  const { toast } = useToast();

  const createNewResume = () => {
    toast({
      title: "Création d'un nouveau CV",
      description: "Votre nouveau CV va être créé...",
    });
    // TODO: Implement CV creation logic
  };

  useEffect(() => {
    const loadResumes = async () => {
      try {
        // TODO: Implement resume loading logic
        // This will be implemented when we have the backend setup
        setResumes([]);
      } catch (error) {
        console.error("Error loading resumes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos CVs",
          variant: "destructive",
        });
      }
    };

    loadResumes();
  }, [toast]);

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
              <DropdownMenuItem onClick={createNewResume}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer mon premier CV
              </DropdownMenuItem>
            ) : (
              <>
                {resumes.map((resume) => (
                  <DropdownMenuItem key={resume}>
                    <FileText className="w-4 h-4 mr-2" />
                    {resume}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={createNewResume}>
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
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p>Vous n'avez pas encore de CV. Créez-en un nouveau !</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resumes.map((resume) => (
              <Card key={resume} className="cursor-pointer hover:bg-gray-50">
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
