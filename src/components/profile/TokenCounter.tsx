
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth } from "firebase/auth";

export const TokenCounter = () => {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MAX_TOKENS = 100000;

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
        const idToken = await user.getIdToken();
        const baseUrl = "https://cv-generator-447314-default-rtdb.europe-west1.firebasedatabase.app";

        // Utilisation du chemin /users/{userId} conformément aux règles
        const response = await fetch(`${baseUrl}/users/${user.uid}/tokens.json?auth=${idToken}`);

        if (!response.ok) {
          console.error(`Erreur HTTP ${response.status}: ${response.statusText}`);
          const errorData = await response.text();
          console.error("Détails de l'erreur:", errorData);
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setTokens(data?.total_tokens || 0);
      } catch (err) {
        console.error("Erreur lors de la récupération des tokens:", err);
        setError("Erreur lors de la récupération des tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
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
          <div className="text-center text-red-500">{error}</div>
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
