
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TokenCounter = () => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_TOKENS = 100000;
  const MAX_RETRIES = 3;

  useEffect(() => {
    const auth = getAuth();
    let unsubscribe: () => void;

    const fetchTokens = async (idToken: string) => {
      console.log("Tentative de récupération des tokens...");
      console.log("Token utilisé:", idToken.substring(0, 10) + "...");
      
      try {
        const response = await fetch(`https://backend-flask-177360827241.europe-west9.run.app/get-total-tokens`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
        });

        console.log("Statut de la réponse:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur détaillée:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues:", data);
        
        if (typeof data.total_tokens !== 'number') {
          throw new Error("Format de données invalide");
        }
        return data.total_tokens;
      } catch (error) {
        console.error("Erreur complète:", error);
        throw error;
      }
    };

    const setupAuthListener = () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setError("Utilisateur non connecté");
          setLoading(false);
          return;
        }

        try {
          console.log("Utilisateur connecté, récupération du token...");
          const idToken = await user.getIdToken();
          const totalTokens = await fetchTokens(idToken);
          setTokens(totalTokens);
          setRetryCount(0);
          setError(null);
        } catch (err) {
          console.error("Erreur détaillée lors de la récupération des tokens:", err);
          
          if (retryCount < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(`Nouvelle tentative dans ${delay}ms...`);
            setTimeout(() => setRetryCount(prev => prev + 1), delay);
          } else {
            setError("Erreur lors de la récupération des tokens");
          }
        } finally {
          setLoading(false);
        }
      });
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [retryCount]);

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
