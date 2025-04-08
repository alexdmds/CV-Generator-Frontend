
import { FileText, Loader2, FileX, RefreshCcw, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CVPreviewPanelProps {
  isGenerating: boolean;
  isChecking: boolean;
  pdfUrl: string | null;
  checkFailed: boolean;
  retryCheckForExistingCV: () => void;
}

export const CVPreviewPanel = ({
  isGenerating,
  isChecking,
  pdfUrl,
  checkFailed,
  retryCheckForExistingCV
}: CVPreviewPanelProps) => {
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [useDirectView, setUseDirectView] = useState(false);
  
  // Réinitialiser l'état d'erreur lorsque l'URL du PDF change
  useEffect(() => {
    if (pdfUrl) {
      setPdfLoadError(false);
      setUseDirectView(false);
    }
  }, [pdfUrl]);

  const handlePdfError = () => {
    console.error("Failed to load PDF in iframe, setting error state");
    setPdfLoadError(true);
  };
  
  const handleRetry = () => {
    console.log("Retrying CV loading...");
    setPdfLoadError(false);
    setUseDirectView(false);
    retryCheckForExistingCV();
  };
  
  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleUseDirectView = () => {
    setUseDirectView(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Aperçu du CV</span>
          {isChecking && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Chargement...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="p-6 text-center">
            <ProfileGeneratingIndicator 
              message="Génération du CV en cours..."
            />
          </div>
        ) : pdfUrl && !pdfLoadError ? (
          <div className="rounded-md overflow-hidden">
            {useDirectView ? (
              <div className="p-4 text-center">
                <Alert className="mb-4">
                  <AlertDescription>
                    L'aperçu intégré n'est pas disponible. Utilisez les boutons ci-dessous pour visualiser ou télécharger votre CV.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <Button 
                    variant="default" 
                    onClick={handleOpenInNewTab}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = pdfUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <iframe 
                  src={pdfUrl}
                  className="w-full h-[500px] border border-gray-300"
                  title="CV généré"
                  onError={handlePdfError}
                />
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Button 
                    variant="default" 
                    onClick={handleOpenInNewTab}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = pdfUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4 flex flex-col items-center justify-center">
              <FileX className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {pdfLoadError ? "Erreur de chargement du PDF" : "CV pas encore généré"}
              </h3>
              <p className="text-gray-500 mt-2">
                {pdfLoadError 
                  ? "Impossible d'afficher le PDF dans l'aperçu. Essayez de l'ouvrir directement."
                  : "Aucun CV n'a encore été généré avec ce nom."}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {pdfLoadError && pdfUrl && (
                  <Button 
                    variant="default" 
                    onClick={handleUseDirectView}
                    className="flex items-center"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Utiliser la vue directe
                  </Button>
                )}
                
                {(checkFailed || pdfLoadError) && (
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    className="flex items-center"
                    size="sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Vérifier à nouveau
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
