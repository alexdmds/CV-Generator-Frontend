
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, RefreshCcw, FileX } from "lucide-react";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useCallback, useState, useEffect, useRef } from "react";
import { auth } from "@/components/auth/firebase-config";
import { Skeleton } from "@/components/ui/skeleton";
import { checkCVExists } from "@/utils/apiService";

interface CVPreviewPanelProps {
  isGenerating: boolean;
  isChecking: boolean;
  pdfUrl: string | null;
  cvName: string;
  checkFailed: boolean;
  retryCheckForExistingCV: (cvName: string) => void;
  refreshPdfDisplay: (userId: string, cvName: string) => string;
}

export function CVPreviewPanel({
  isGenerating,
  isChecking,
  pdfUrl,
  cvName,
  checkFailed,
  retryCheckForExistingCV,
  refreshPdfDisplay
}: CVPreviewPanelProps) {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [confirmedPdfExists, setConfirmedPdfExists] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Vérification indépendante de l'existence du PDF
  useEffect(() => {
    const verifyPdfExists = async () => {
      if (!cvName || isGenerating) {
        setConfirmedPdfExists(false);
        return;
      }
      
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        console.log("Vérification indépendante de l'existence du PDF");
        const exists = await checkCVExists(user.uid, cvName);
        console.log(`Résultat de vérification indépendante: ${exists}`);
        setConfirmedPdfExists(exists);
        
        if (!exists) {
          setPdfError(true);
          setPdfLoaded(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification indépendante:", error);
        setConfirmedPdfExists(false);
        setPdfError(true);
      }
    };
    
    verifyPdfExists();
  }, [cvName, isGenerating]);
  
  // Reset states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setPdfLoaded(false);
      setPdfError(false);
    } else {
      setPdfError(true);
    }
  }, [pdfUrl]);
  
  // Function to handle refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
      setPdfLoaded(false);
      setPdfError(false);
      setConfirmedPdfExists(null);
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setPdfLoaded(false);
    setPdfError(false);
    setConfirmedPdfExists(null);
  }, [retryCheckForExistingCV, cvName]);

  // Handle actual iframe load event
  const handleIframeLoad = useCallback(() => {
    setPdfLoaded(true);
    setPdfError(false);
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Vérifier si l'iframe a chargé un contenu valide
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Si on peut accéder à contentWindow sans erreur, c'est bon signe
        console.log("PDF iframe loaded successfully");
        setConfirmedPdfExists(true);
      }
    } catch (e) {
      console.log("PDF might exist but caused a CORS error, consider it loaded");
      setConfirmedPdfExists(true);
    }
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error("PDF iframe failed to load");
    setPdfError(true);
    setConfirmedPdfExists(false);
  }, []);

  // Open PDF in new tab
  const handleOpenPdf = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, [pdfUrl]);

  // Déterminer ce qui doit être affiché
  const shouldShowLoadingState = isGenerating || isChecking;
  const shouldShowErrorState = !shouldShowLoadingState && 
                               (checkFailed || pdfError || confirmedPdfExists === false);
  const shouldShowPdfState = !shouldShowLoadingState && 
                             !shouldShowErrorState && 
                             pdfUrl && 
                             (confirmedPdfExists === true || confirmedPdfExists === null);

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
          {!isChecking && pdfUrl && pdfLoaded && !pdfError && (
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
      <CardContent>
        {shouldShowLoadingState ? (
          <div className="p-6 text-center">
            <ProfileGeneratingIndicator 
              message={isGenerating ? "Génération du CV en cours..." : "Vérification de l'existence du CV..."}
            />
          </div>
        ) : shouldShowPdfState ? (
          <div className="rounded-md overflow-hidden border border-gray-300 relative">
            {/* Loading indicator for PDF */}
            {!pdfLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            
            {/* Create a wrapper that only shows the iframe when it's successfully loaded */}
            <div className="w-full h-[500px] relative">
              {pdfUrl && (
                <iframe 
                  ref={iframeRef}
                  src={pdfUrl}
                  className={`w-full h-full ${pdfLoaded ? 'visible' : 'invisible'}`}
                  title="CV généré"
                  key={pdfUrl} // Force iframe reset when URL changes
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
              
              {/* Explicitly show a loading indicator while trying to load */}
              {!pdfLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Skeleton className="w-full h-full absolute inset-0" />
                </div>
              )}
            </div>
            
            {/* Actions for loaded PDF */}
            <div className="mt-4 flex justify-center space-x-4">
              <Button 
                variant="default" 
                onClick={handleOpenPdf}
                disabled={!pdfLoaded}
              >
                <FileText className="w-4 h-4 mr-2" />
                Voir le PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshPdf}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Rafraîchir
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
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="mt-4 flex items-center"
                size="sm"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Vérifier à nouveau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
