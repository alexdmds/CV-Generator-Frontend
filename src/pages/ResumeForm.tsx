
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { useState } from "react";

const ResumeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");

  const handleGenerateResume = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez copier la fiche de poste avant de générer un CV",
        variant: "destructive",
      });
      return;
    }

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
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                  Fiche de poste
                </label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Copiez-collez ici l'intégralité de la fiche de poste..."
                  className="min-h-[300px] w-full"
                />
                <p className="text-xs text-gray-500">
                  Copiez l'intégralité de la fiche de poste pour une meilleure qualité de génération.
                </p>
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
