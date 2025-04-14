
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
  const [displayMode, setDisplayMode] = useState<'loading' | 'pdf' | 'error'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Vérification indépendante de l'existence du PDF
  useEffect(() => {
    const verifyPdfExists = async () => {
      if (!cvName || isGenerating) {
        setConfirmedPdfExists(false);
        setDisplayMode('error');
        return;
      }
      
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        console.log("Vérification indépendante dans Firestore");
        const exists = await checkCVExists(user.uid, cvName);
        console.log(`Résultat de vérification Firestore: ${exists}`);
        setConfirmedPdfExists(exists);
        
        if (exists) {
          setDisplayMode('pdf');
        } else {
          setDisplayMode('error');
          setPdfError(true);
          setPdfLoaded(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification Firestore:", error);
        setConfirmedPdfExists(false);
        setPdfError(true);
        setDisplayMode('error');
      }
    };
    
    verifyPdfExists();
  }, [cvName, isGenerating]);
  
  // Reset states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setPdfLoaded(false);
      setPdfError(false);
      setDisplayMode('loading');
    } else {
      setPdfError(true);
      setDisplayMode('error');
    }
  }, [pdfUrl]);
  
  // Function to handle refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
      setPdfLoaded(false);
      setPdfError(false);
      setDisplayMode('loading');
      setConfirmedPdfExists(null);
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setPdfLoaded(false);
    setPdfError(false);
    setDisplayMode('loading');
    setConfirmedPdfExists(null);
  }, [retryCheckForExistingCV, cvName]);

  // Handle actual iframe load event
  const handleIframeLoad = useCallback(() => {
    setPdfLoaded(true);
    setPdfError(false);
    setDisplayMode('pdf');
    
    // Si l'iframe a chargé, on considère que le PDF existe
    setConfirmedPdfExists(true);
    console.log("PDF iframe loaded successfully");
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error("PDF iframe failed to load");
    setPdfError(true);
    setDisplayMode('error');
    setConfirmedPdfExists(false);
  }, []);

  // Open PDF in new tab
  const handleOpenPdf = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, [pdfUrl]);

  // Déterminer ce qui doit être affiché
  const shouldShowLoadingState = isGenerating || isChecking || 
                               (displayMode === 'loading' && !pdfLoaded && pdfUrl);
  
  const shouldShowErrorState = !isGenerating && !isChecking && 
                              (displayMode === 'error' || checkFailed || 
                               confirmedPdfExists === false);
  
  const shouldShowPdfState = !isGenerating && !isChecking && 
                            displayMode === 'pdf' && pdfUrl && 
                            (pdfLoaded || confirmedPdfExists === true);

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
          {!isChecking && shouldShowPdfState && (
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
            {/* Create a wrapper that only shows content when PDF is available */}
            <div className="w-full h-[500px] relative">
              {/* Le PDF est disponible et peut être affiché */}
              {pdfUrl && (
                <>
                  {/* Nous utilisons un lien direct plutôt qu'un iframe pour éviter les problèmes CORS */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-700 text-center mb-4">
                      Le CV a été généré avec succès.
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Actions for loaded PDF */}
            <div className="mt-4 flex justify-center space-x-4">
              <Button 
                variant="default" 
                onClick={handleOpenPdf}
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
