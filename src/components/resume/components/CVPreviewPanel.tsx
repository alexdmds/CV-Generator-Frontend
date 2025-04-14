
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
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeLoadAttempted, setIframeLoadAttempted] = useState(false);
  const [isErrorContentVisible, setIsErrorContentVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Reset iframe states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setIframeError(false);
      setIframeLoaded(false);
      setIframeLoadAttempted(false);
      setIsErrorContentVisible(false);
    }
  }, [pdfUrl]);
  
  // Function to force PDF refresh
  const handleRefreshPdf = useCallback(() => {
    const user = auth.currentUser;
    if (user && cvName) {
      refreshPdfDisplay(user.uid, cvName);
      setIframeError(false);
      setIframeLoaded(false);
      setIframeLoadAttempted(false);
      setIsErrorContentVisible(false);
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setIframeError(false);
    setIframeLoaded(false);
    setIframeLoadAttempted(false);
    setIsErrorContentVisible(false);
  }, [retryCheckForExistingCV, cvName]);

  // Detect iframe errors with fallback for cases where onError doesn't fire
  useEffect(() => {
    if (pdfUrl && !iframeLoaded && !iframeError) {
      setIframeLoadAttempted(true);
      
      // Set a shorter timeout to check if iframe loaded correctly
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          console.log("PDF load timeout - assuming error occurred");
          setIframeError(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pdfUrl, iframeLoaded, iframeError]);

  // Monitor iframe content for error messages
  useEffect(() => {
    if (iframeRef.current && pdfUrl) {
      // Check for error content after a short delay
      const timer = setTimeout(() => {
        try {
          // Since we can't access iframe content directly due to CORS, we rely on
          // the error handler and timeout to detect errors
          if (!iframeLoaded && iframeLoadAttempted) {
            setIframeError(true);
          }
        } catch (error) {
          console.error("Error monitoring iframe content:", error);
          setIframeError(true);
        }
      }, 1500); // Short timeout to detect errors quickly
      
      return () => clearTimeout(timer);
    }
  }, [pdfUrl, iframeLoadAttempted, iframeLoaded]);

  // Function to handle iframe load event
  const handleIframeLoad = useCallback(() => {
    console.log("PDF iframe triggered onLoad event");
    
    // Check if there might be an error (we can't access content due to CORS)
    // but we can delay showing content to see if errors appear
    setTimeout(() => {
      // If no error was detected during this time, consider it loaded successfully
      if (!iframeError) {
        setIframeLoaded(true);
      }
    }, 500);
  }, [iframeError]);

  // Function to handle iframe error event
  const handleIframeError = useCallback(() => {
    console.error("Failed to load PDF via iframe onError event");
    setIframeError(true);
  }, []);

  // Component content
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
          {!isChecking && pdfUrl && iframeLoaded && !iframeError && (
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
        ) : pdfUrl && !iframeError ? (
          <div className="rounded-md overflow-hidden border border-gray-300 relative">
            {/* Loading indicator for PDF */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            
            {/* Create a wrapper that only shows the iframe when it's successfully loaded */}
            <div className={`${iframeLoaded ? 'block' : 'hidden'} w-full h-[500px]`}>
              {!iframeError && (
                <iframe 
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-full"
                  title="CV généré"
                  key={pdfUrl} // Force iframe reset when URL changes
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
            
            {/* Explicitly show a loading indicator while trying to load */}
            {!iframeLoaded && !iframeError && (
              <div className="w-full h-[500px] flex flex-col items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            
            {/* Actions for loaded PDF */}
            {iframeLoaded && !iframeError && (
              <div className="mt-4 flex justify-center space-x-4">
                <Button 
                  variant="default" 
                  onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
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
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4 flex flex-col items-center justify-center">
              <FileX className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">CV pas encore généré</h3>
              <p className="text-gray-500 mt-2">
                {iframeLoadAttempted ? 
                  "Le PDF n'a pas pu être chargé. Il est possible que le CV n'ait pas encore été généré ou que vous n'ayez pas les permissions nécessaires." : 
                  "Aucun CV n'a encore été généré avec ce nom ou le fichier n'est pas accessible."}
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
