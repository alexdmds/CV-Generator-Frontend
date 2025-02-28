
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

export const TokenCounter = () => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_TOKENS = 1000000;
  const MAX_RETRIES = 3;
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    let unsubscribe: () => void;

    const fetchTokens = async (userId: string) => {
      console.log("Tentative de récupération des tokens depuis Firestore...");
      
      try {
        const tokenStatsRef = doc(db, "token_stats", userId);
        const tokenStatsDoc = await getDoc(tokenStatsRef);
        
        if (tokenStatsDoc.exists()) {
          const data = tokenStatsDoc.data();
          console.log("Données de tokens reçues:", data);
          
          if (typeof data.total_tokens === 'number') {
            return data.total_tokens;
          } else {
            console.log("Format de tokens invalide:", data.total_tokens);
            return 0;
          }
        } else {
          console.log("Aucun document de tokens trouvé pour l'utilisateur");
          return 0;
        }
      } catch (error) {
        console.error("Erreur complète lors de la récupération des tokens:", error);
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
          console.log("Utilisateur connecté, récupération des tokens...");
          const totalTokens = await fetchTokens(user.uid);
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
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de récupérer les informations de tokens."
            });
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
  }, [retryCount, toast]);

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
