
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileIcon } from "lucide-react";

interface CVDetailsPanelProps {
  cvName: string;
  jobDescription: string;
  jobSumup?: string | null;
}

export function CVDetailsPanel({ cvName, jobDescription, jobSumup }: CVDetailsPanelProps) {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Détails du CV
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">Nom du CV</h3>
          <p className="p-3 bg-gray-50 rounded-md border text-gray-700">{cvName}</p>
        </div>
        
        {jobSumup && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
              <FileIcon className="w-4 h-4 mr-2 text-amber-600" />
              Résumé de la fiche de poste
            </h3>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100 text-gray-700 whitespace-pre-wrap">
              {jobSumup}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            Fiche de poste complète
          </h3>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {jobDescription}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
