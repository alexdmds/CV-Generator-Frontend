import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, RefreshCcw, FileX, ExternalLink, Download } from "lucide-react";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useCallback, useEffect, useState } from "react";
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
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());

  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found when trying to refresh PDF");
      return;
    }

    if (cvId) {
      console.log("Refreshing PDF with document ID:", cvId);
      refreshPdfDisplay(user.uid, cvId, cvName);
    } else if (cvName) {
      console.log("Refreshing PDF with CV name:", cvName);
      refreshPdfDisplay(user.uid, cvName);
    } else {
      console.error("Neither cvId nor cvName provided for refresh");
    }
    
    setIframeKey(Date.now());
    setLoadError(false);
  }, [cvId, cvName, refreshPdfDisplay]);

  const handleRetry = useCallback(() => {
    console.log("Retrying CV existence check for:", cvName);
    retryCheckForExistingCV(cvName);
    setLoadError(false);
    setIframeKey(Date.now());
  }, [retryCheckForExistingCV, cvName]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${cvName || 'cv'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    if (cvId && !isGenerating && !isChecking) {
      const user = auth.currentUser;
      if (user) {
        console.log("Auto-refreshing PDF on component mount/update for CV ID:", cvId);
        refreshPdfDisplay(user.uid, cvId, cvName);
        setIframeKey(Date.now());
      }
    }
  }, [cvId, isGenerating, isChecking, refreshPdfDisplay, cvName]);

  const handlePdfLoadError = useCallback(() => {
    console.error("Failed to load PDF, setting loadError to true");
    setLoadError(true);
  }, []);

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
          {!isChecking && pdfUrl && !loadError && (
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
        ) : pdfUrl && !loadError ? (
          <div className="overflow-hidden rounded-b-md">
            <iframe 
              src={pdfUrl}
              className="w-full h-[650px] border-0"
              title="CV généré"
              key={iframeKey}
              onError={handlePdfLoadError}
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
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
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
              <h3 className="text-lg font-medium text-gray-900">
                {loadError ? "Erreur de chargement du PDF" : "CV pas encore généré"}
              </h3>
              <p className="text-gray-500 mt-2">
                {loadError 
                  ? "Impossible de charger le PDF. Le fichier est peut-être inaccessible ou n'existe pas."
                  : "Aucun CV n'a encore été généré avec ce nom ou le fichier n'est pas accessible."
                }
              </p>
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="mt-4 flex items-center"
                size="sm"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                {loadError ? "Essayer à nouveau" : "Vérifier à nouveau"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
