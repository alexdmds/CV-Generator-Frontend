
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, RefreshCcw, FileX } from "lucide-react";
import { ProfileGeneratingIndicator } from "@/components/profile/ProfileGeneratingIndicator";
import { useCallback, useState, useEffect } from "react";
import { auth } from "@/components/auth/firebase-config";

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
  
  // Reset iframe states when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setIframeError(false);
      setIframeLoaded(false);
      setIframeLoadAttempted(false);
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
    }
  }, [cvName, refreshPdfDisplay]);

  // Function to handle retry
  const handleRetry = useCallback(() => {
    retryCheckForExistingCV(cvName);
    setIframeError(false);
    setIframeLoaded(false);
    setIframeLoadAttempted(false);
  }, [retryCheckForExistingCV, cvName]);

  // We need to set a timeout to detect when an iframe might be showing an error
  // This helps us catch errors that don't trigger the onError event
  useEffect(() => {
    if (pdfUrl && !iframeLoaded && !iframeError && !isGenerating) {
      setIframeLoadAttempted(true);
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          console.log("PDF load timeout - assuming error occurred");
          setIframeError(true);
        }
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [pdfUrl, iframeLoaded, iframeError, isGenerating]);

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
            
            {/* Hidden iframe to attempt loading the PDF */}
            <iframe 
              src={pdfUrl}
              className={`w-full h-[500px] ${iframeLoaded ? 'block' : 'opacity-0'}`}
              title="CV généré"
              key={pdfUrl} // Force iframe reset when URL changes
              onLoad={() => {
                // Check if the iframe has actually loaded a PDF vs an error page
                console.log("PDF iframe triggered onLoad event");
                
                // We can't reliably detect the content of the iframe due to CORS,
                // so we'll assume success if we get here and show the iframe
                setIframeLoaded(true);
              }}
              onError={() => {
                console.error("Failed to load PDF via iframe onError event");
                setIframeError(true);
              }}
              sandbox="allow-same-origin allow-scripts"
            />
            
            {/* Actions for loaded PDF */}
            {iframeLoaded && (
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
                  "Le PDF n'a pas pu être chargé. Il est possible que le CV n'ait pas encore été généré." : 
                  "Aucun CV n'a encore été généré avec ce nom ou le fichier n'est pas accessible."}
              </p>
              {(checkFailed || iframeError) && (
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
