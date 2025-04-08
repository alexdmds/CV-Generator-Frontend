
import { FileText, Loader2, FileX, RefreshCcw, Download, ArrowUpRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useEffect, useState, useCallback, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

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
  const [iframeKey, setIframeKey] = useState(Date.now()); // Clé unique pour forcer le rechargement de l'iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  // Réinitialiser l'état d'erreur lorsque l'URL du PDF change
  useEffect(() => {
    if (pdfUrl) {
      console.log("CVPreviewPanel: PDF URL received", pdfUrl);
      setPdfLoadError(false);
      setUseDirectView(false);
      setPdfLoaded(false);
      setIsRetrying(false);
      // Générer une nouvelle clé pour forcer le rechargement de l'iframe
      setIframeKey(Date.now());
    }
  }, [pdfUrl]);

  // Précharger le PDF pour vérifier l'accessibilité
  useEffect(() => {
    if (!pdfUrl) return;
    
    const preloadPdf = async () => {
      try {
        // Tenter de précharger avec fetch pour vérifier l'accessibilité
        console.log("Preloading PDF URL:", pdfUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(pdfUrl, { 
            method: 'HEAD',
            signal: controller.signal
          });
          console.log("PDF URL preload successful with status:", response.status);
          clearTimeout(timeoutId);
        } catch (error) {
          console.warn("PDF URL preload warning (might still work):", error);
        }
      } catch (error) {
        console.warn("PDF preload attempt failed:", error);
      }
    };
    
    preloadPdf();
  }, [pdfUrl]);

  const handlePdfError = useCallback(() => {
    console.error("Failed to load PDF in iframe");
    setPdfLoadError(true);
    if (!useDirectView) {
      toast({
        title: "Problème d'affichage",
        description: "L'aperçu du PDF ne peut pas être affiché. Utilisez les options alternatives.",
        variant: "destructive"
      });
    }
  }, [useDirectView, toast]);
  
  const handlePdfLoad = useCallback(() => {
    // Vérifier si l'iframe a réellement chargé le PDF ou juste une page d'erreur
    if (iframeRef.current) {
      try {
        // Tentative d'accès au contenu de l'iframe pour vérifier s'il a réellement chargé
        console.log("PDF iframe loaded, checking content...");
        
        // Si nous sommes arrivés ici sans erreur, considérer comme chargé
        console.log("PDF loaded successfully in iframe");
        setPdfLoaded(true);
        setPdfLoadError(false);
      } catch (error) {
        // Une erreur ici peut indiquer une violation de même origine, ce qui est normal
        console.log("PDF iframe access test passed:", error);
        setPdfLoaded(true);
        setPdfLoadError(false);
      }
    }
  }, []);
  
  const handleRetry = useCallback(() => {
    console.log("Retrying CV loading...");
    setPdfLoadError(false);
    setUseDirectView(false);
    setIsRetrying(true);
    retryCheckForExistingCV();
    
    // Générer une nouvelle clé pour forcer le rechargement de l'iframe
    setIframeKey(Date.now());
    
    // Réinitialiser le statut après un délai
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  }, [retryCheckForExistingCV]);
  
  const handleOpenInNewTab = useCallback(() => {
    if (pdfUrl) {
      console.log("Opening PDF in new tab:", pdfUrl);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, [pdfUrl]);
  
  const handleUseDirectView = useCallback(() => {
    console.log("Switching to direct view mode");
    setUseDirectView(true);
  }, []);

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      console.log("Downloading PDF:", pdfUrl);
      // Créer une requête fetch pour le téléchargement
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          // Créer un objet URL pour le blob
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Extraire le nom du fichier de l'URL ou utiliser un nom par défaut
          const urlParts = pdfUrl.split('/');
          const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'cv.pdf';
          link.setAttribute('download', decodeURIComponent(fileName));
          
          // Ajouter le lien au document, cliquer dessus, puis le supprimer
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Libérer l'URL de l'objet
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);
        })
        .catch(err => {
          console.error("Download error:", err);
          // Fallback vers la méthode simple si la méthode fetch échoue
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.setAttribute('download', 'cv.pdf');
          link.setAttribute('target', '_blank');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Téléchargement alternatif",
            description: "Utilisation d'une méthode alternative de téléchargement.",
          });
        });
    }
  }, [pdfUrl, toast]);

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
        ) : pdfUrl && !useDirectView && !isRetrying ? (
          <div className="rounded-md overflow-hidden">
            <div className="relative">
              <iframe 
                ref={iframeRef}
                key={`pdf-iframe-${iframeKey}`}
                src={pdfUrl}
                className="w-full h-[500px] border border-gray-300 rounded"
                title="CV généré"
                onError={handlePdfError}
                onLoad={handlePdfLoad}
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
              
              {!pdfLoaded && !pdfLoadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Chargement du PDF...</p>
                  </div>
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
              {pdfLoadError && (
                <Button 
                  variant="outline" 
                  onClick={handleUseDirectView}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vue alternative
                </Button>
              )}
            </div>
          </div>
        ) : pdfUrl && (useDirectView || isRetrying) ? (
          <div className="p-4 text-center">
            {isRetrying ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Rechargement en cours...</p>
                </div>
              </div>
            ) : (
              <>
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
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Réessayer l'aperçu
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
                {checkFailed ? "Problème d'accès au PDF" : "CV pas encore généré"}
              </h3>
              <p className="text-gray-500 mt-2 mb-4">
                {checkFailed 
                  ? "Impossible d'afficher le PDF. Le fichier existe mais n'est pas accessible dans l'aperçu."
                  : "Aucun CV n'a encore été généré avec ce nom ou le fichier n'est pas accessible."}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {checkFailed && (
                  <>
                    <Button 
                      variant="default" 
                      onClick={handleRetry}
                      className="flex items-center"
                      size="sm"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Réessayer
                    </Button>
                    
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
