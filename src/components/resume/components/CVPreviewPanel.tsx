
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
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Reset states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setPdfLoaded(false);
      setShowPdfViewer(false);
      setLoadAttempted(false);
    }
  }, [pdfUrl]);
  
  // Function to handle refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
      setPdfLoaded(false);
      setShowPdfViewer(false);
      setLoadAttempted(false);
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setPdfLoaded(false);
    setShowPdfViewer(false);
    setLoadAttempted(false);
  }, [retryCheckForExistingCV, cvName]);

  // Try to load the PDF in a hidden iframe first to check if it exists
  useEffect(() => {
    if (pdfUrl && !loadAttempted) {
      setLoadAttempted(true);
      
      // Create a temporary iframe to test loading
      const testIframe = document.createElement('iframe');
      testIframe.style.display = 'none';
      testIframe.src = pdfUrl;
      document.body.appendChild(testIframe);
      
      // Set a timeout to check if the PDF loaded successfully
      const timer = setTimeout(() => {
        try {
          // Try to access content - this will fail with CORS if the PDF exists
          // But we can catch the error if the iframe loads at all
          if (testIframe.contentWindow) {
            // If we can access contentWindow, PDF might exist
            setShowPdfViewer(true);
          }
        } catch (e) {
          // If we get an error about CORS, it means the PDF exists
          setShowPdfViewer(true);
        } finally {
          // Clean up the test iframe
          document.body.removeChild(testIframe);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (document.body.contains(testIframe)) {
          document.body.removeChild(testIframe);
        }
      };
    }
  }, [pdfUrl, loadAttempted]);

  // Handle actual iframe load event
  const handleIframeLoad = useCallback(() => {
    setPdfLoaded(true);
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
          {!isChecking && pdfUrl && pdfLoaded && showPdfViewer && (
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
        ) : pdfUrl && showPdfViewer ? (
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
