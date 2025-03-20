
import { useEffect, useState, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const TokenCounter = ({ onRefreshRequest }: { onRefreshRequest?: (refreshFn: () => void) => void }) => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MAX_TOKENS = 1000000; // 1 million de tokens

  const fetchTokens = useCallback(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();
      const userId = user.uid;
      
      console.log("Tentative de récupération des tokens depuis Firestore...");
      console.log("User ID:", userId);
      
      // Adaptation à la nouvelle structure de données
      const usageRef = doc(db, "usage", userId);
      const usageDoc = await getDoc(usageRef);
      
      if (usageDoc.exists()) {
        const data = usageDoc.data();
        console.log("Données d'usage récupérées:", data);
        
        if (data && typeof data.total_usage === 'number') {
          setTokens(data.total_usage);
        } else {
          console.log("Le champ 'total_usage' n'existe pas ou n'est pas un nombre");
          setTokens(0);
        }
      } else {
        console.log("Aucun document d'usage trouvé pour cet utilisateur");
        setTokens(0);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erreur détaillée lors de la récupération des tokens:", err);
      setError("Erreur lors de la récupération des tokens");
      setTokens(0); // En cas d'erreur, on affiche 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribe: () => void;

    const setupAuthListener = () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setError("Utilisateur non connecté");
          setLoading(false);
          return;
        }

        await fetchTokens();
      });
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchTokens]);

  // Permettre au parent de déclencher une actualisation des tokens
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(fetchTokens);
    }
  }, [fetchTokens, onRefreshRequest]);

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
