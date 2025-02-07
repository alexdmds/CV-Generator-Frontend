import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText } from "lucide-react";

export const ResumeList = () => {
  const resumes = []; // TODO: Fetch resumes from backend

  return (
    <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Mes CV</CardTitle>
        <Button className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Nouveau CV
        </Button>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p>Vous n'avez pas encore de CV. Créez-en un nouveau !</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Resume cards will go here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};