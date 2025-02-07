
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

const ResumeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerateResume = () => {
    toast({
      title: "Génération du CV",
      description: "Votre CV est en cours de génération...",
    });
    // TODO: Implement CV generation logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/resumes")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux CVs
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {id === "new" ? "Nouveau CV" : "Modifier le CV"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Intitulé du poste</Label>
                <Input id="title" placeholder="ex: Développeur Frontend React" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input id="company" placeholder="ex: Acme Inc." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description du poste</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le poste et ses responsabilités..."
                  className="min-h-[150px]"
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerateResume}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer le CV
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeForm;
