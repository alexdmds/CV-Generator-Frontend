
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const TokenCounter = () => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MAX_TOKENS = 1000000; // 1 million de tokens

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    let unsubscribe: () => void;

    const fetchTokensFromFirestore = async (userId: string) => {
      try {
        console.log("Tentative de récupération des tokens depuis Firestore...");
        console.log("User ID:", userId);
        
        const tokenStatsRef = doc(db, "token_stats", userId);
        const tokenStatsDoc = await getDoc(tokenStatsRef);
        
        if (tokenStatsDoc.exists()) {
          const data = tokenStatsDoc.data();
          console.log("Données récupérées:", data);
          
          if (data && typeof data.total_tokens === 'number') {
            return data.total_tokens;
          } else {
            console.log("Le champ 'total_tokens' n'existe pas ou n'est pas un nombre");
            return 0;
          }
        } else {
          console.log("Aucun document trouvé pour cet utilisateur");
          return 0;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tokens:", error);
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
          const userId = user.uid;
          const totalTokens = await fetchTokensFromFirestore(userId);
          setTokens(totalTokens);
          setError(null);
        } catch (err) {
          console.error("Erreur détaillée lors de la récupération des tokens:", err);
          setError("Erreur lors de la récupération des tokens");
          setTokens(0); // En cas d'erreur, on affiche 0
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
  }, []);

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
