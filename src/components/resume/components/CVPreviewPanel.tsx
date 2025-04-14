
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, RefreshCcw, FileX } from "lucide-react";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useCallback, useState, useEffect, useRef } from "react";
import { auth } from "@/components/auth/firebase-config";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loadAttempted, setLoadAttempted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Reset states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setPdfLoaded(false);
      setPdfError(false);
      setLoadAttempted(false);
    }
  }, [pdfUrl]);
  
  // Function to handle refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
      setPdfLoaded(false);
      setPdfError(false);
      setLoadAttempted(false);
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setPdfLoaded(false);
    setPdfError(false);
    setLoadAttempted(false);
  }, [retryCheckForExistingCV, cvName]);

  // Fetch the PDF using a HEAD request to check if it exists
  useEffect(() => {
    if (pdfUrl && !loadAttempted && !isGenerating) {
      setLoadAttempted(true);
      
      // Set a timeout to consider the PDF as unavailable after 5 seconds
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        if (!pdfLoaded) {
          console.log("PDF load timeout, considering as error");
          setPdfError(true);
        }
      }, 5000);
      
      // Check if the PDF exists by making a HEAD request
      fetch(pdfUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            // Le PDF existe et est accessible
            setPdfError(false);
          } else {
            // Le PDF n'existe pas ou n'est pas accessible
            console.log("PDF not found or not accessible:", response.status);
            setPdfError(true);
          }
        })
        .catch(error => {
          // Une erreur s'est produite lors de la vérification
          console.error("Error checking PDF existence:", error);
          setPdfError(true);
        });
    }
    
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [pdfUrl, loadAttempted, pdfLoaded, isGenerating]);

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
        // Mais cela ne garantit pas que le PDF est correctement chargé
        console.log("PDF iframe loaded successfully");
      }
    } catch (e) {
      // Une erreur CORS peut se produire ici même si le PDF existe
      console.log("PDF might exist but caused a CORS error, consider it loaded");
    }
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error("PDF iframe failed to load");
    setPdfError(true);
  }, []);

  // Open PDF in new tab
  const handleOpenPdf = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, [pdfUrl]);

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
        {isGenerating ? (
          <div className="p-6 text-center">
            <ProfileGeneratingIndicator 
              message="Génération du CV en cours..."
            />
          </div>
        ) : pdfUrl && !pdfError ? (
          <div className="rounded-md overflow-hidden border border-gray-300 relative">
            {/* Loading indicator for PDF */}
            {!pdfLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            
            {/* Create a wrapper that only shows the iframe when it's successfully loaded */}
            <div className="w-full h-[500px] relative">
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
