
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, RefreshCcw, FileX, ExternalLink } from "lucide-react";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useCallback } from "react";
import { auth } from "@/components/auth/firebase-config";

interface CVPreviewPanelProps {
  isGenerating: boolean;
  isChecking: boolean;
  pdfUrl: string | null;
  cvName: string;
  cvId?: string;
  checkFailed: boolean;
  retryCheckForExistingCV: (cvName: string) => void;
  refreshPdfDisplay: (userId: string, cvId: string, cvName?: string) => string;
}

export function CVPreviewPanel({
  isGenerating,
  isChecking,
  pdfUrl,
  cvName,
  cvId,
  checkFailed,
  retryCheckForExistingCV,
  refreshPdfDisplay
}: CVPreviewPanelProps) {
  // Function to force PDF refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvId) {
      refreshPdfDisplay(user.uid, cvId, cvName);
    } else if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
    }
  }, [cvId, cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
  }, [retryCheckForExistingCV, cvName]);

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <span>Aperçu du CV</span>
          {isChecking && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Chargement...
            </div>
          )}
          {!isChecking && pdfUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPdf}
              className="flex items-center"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isGenerating ? (
          <div className="p-6 text-center">
            <ProfileGeneratingIndicator 
              message="Génération du CV en cours..."
            />
          </div>
        ) : pdfUrl ? (
          <div className="overflow-hidden rounded-b-md">
            <iframe 
              src={pdfUrl}
              className="w-full h-[650px] border-0"
              title="CV généré"
              key={pdfUrl} // Force iframe reset when URL changes
              onError={() => {
                console.error("Failed to load PDF, setting checkFailed to true");
                handleRetry();
              }}
            />
            <div className="flex justify-center space-x-4 py-4 bg-gray-50 border-t">
              <Button 
                variant="default" 
                onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir en plein écran
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshPdf}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4 flex flex-col items-center justify-center">
              <FileX className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">CV pas encore généré</h3>
              <p className="text-gray-500 mt-2">
                Aucun CV n'a encore été généré avec ce nom ou le fichier n'est pas accessible.
              </p>
              {checkFailed && (
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="mt-4 flex items-center"
                  size="sm"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Vérifier à nouveau
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
