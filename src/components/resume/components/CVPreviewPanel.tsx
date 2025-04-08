
import { FileText, Loader2, FileX, RefreshCcw, Download, ArrowUpRight, Eye } from "lucide-react";
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
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Réinitialiser l'état d'erreur lorsque l'URL du PDF change
  useEffect(() => {
    if (pdfUrl) {
      console.log("CVPreviewPanel: PDF URL received", pdfUrl);
      setPdfLoadError(false);
      setUseDirectView(false);
      setPdfLoaded(false);
      setIsRetrying(false);
      
      // Essayer de précharger l'URL pour vérifier si elle est accessible
      const precheck = async () => {
        try {
          console.log("Prechecking PDF URL...");
          await fetch(pdfUrl, { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-cache' 
          });
          console.log("PDF URL precheck success");
          setPdfLoaded(true);
        } catch (error) {
          console.warn("PDF URL precheck warning:", error);
          // On ne marque pas comme erreur pour laisser l'iframe essayer
        }
      };
      
      precheck();
    }
  }, [pdfUrl]);

  const handlePdfError = () => {
    console.error("Failed to load PDF in iframe, setting error state");
    setPdfLoadError(true);
  };
  
  const handlePdfLoad = () => {
    console.log("PDF loaded successfully in iframe");
    setPdfLoaded(true);
    setPdfLoadError(false);
  };
  
  const handleRetry = () => {
    console.log("Retrying CV loading...");
    setPdfLoadError(false);
    setUseDirectView(false);
    setIsRetrying(true);
    retryCheckForExistingCV();
    
    // Forcer un nouveau chargement de l'iframe
    setTimeout(() => {
      setIsRetrying(false);
    }, 500);
  };
  
  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      console.log("Opening PDF in new tab:", pdfUrl);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleUseDirectView = () => {
    console.log("Switching to direct view mode");
    setUseDirectView(true);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      console.log("Downloading PDF:", pdfUrl);
      // Téléchargement direct via un lien temporaire
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', 'cv.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  {!isRetrying && (
                    <iframe 
                      key={`pdf-iframe-${pdfUrl}`}
                      src={pdfUrl}
                      className="w-full h-[500px] border border-gray-300"
                      title="CV généré"
                      onError={handlePdfError}
                      onLoad={handlePdfLoad}
                      sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                  )}
                  {isRetrying && (
                    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
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
                    onClick={handleDownload}
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
              <p className="text-gray-500 mt-2 mb-4">
                {pdfLoadError 
                  ? "Impossible d'afficher le PDF dans l'aperçu. Essayez de l'ouvrir directement."
                  : "Aucun CV n'a encore été généré avec ce nom."}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {pdfLoadError && pdfUrl && (
                  <Button 
                    variant="default" 
                    onClick={handleUseDirectView}
                    className="flex items-center"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Utiliser la vue directe
                  </Button>
                )}
                
                {(checkFailed || pdfLoadError) && pdfUrl && (
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
                
                {pdfUrl && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleOpenInNewTab}
                      className="flex items-center"
                      size="sm"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleDownload}
                      className="flex items-center"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
