
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TokenCounter = () => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_TOKENS = 100000;
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchTokens = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      try {
        const idToken = await user.getIdToken(true); // Force token refresh
        console.log("Tentative de récupération des tokens...");
        
        const response = await fetch(`https://auto-cv-creator.lovable.app/get-total-tokens`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          console.error(`Erreur HTTP ${response.status}: ${response.statusText}`);
          const errorText = await response.text();
          console.error("Contenu de la réponse d'erreur:", errorText);
          
          // Retry logic
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            throw new Error(`Retry attempt ${retryCount + 1}`);
          }
          
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues:", data);
        
        if (typeof data.total_tokens !== 'number') {
          console.error("Format de données invalide:", data);
          throw new Error("Format de données invalide");
        }

        setTokens(data.total_tokens);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error("Erreur détaillée lors de la récupération des tokens:", err);
        if (retryCount < MAX_RETRIES) {
          // If we haven't reached max retries, we'll try again
          setTimeout(() => setRetryCount(prev => prev + 1), 1000 * (retryCount + 1));
        } else {
          setError("Erreur lors de la récupération des tokens");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [retryCount]); // Add retryCount as dependency

  const percentage = (tokens / MAX_TOKENS) * 100;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-gray-500">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Tokens utilisés: {tokens.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              Maximum: {MAX_TOKENS.toLocaleString()}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            {percentage.toFixed(1)}% utilisé
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
