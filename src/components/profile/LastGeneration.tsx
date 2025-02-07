
import { useState, useEffect } from "react";
import { getStorage, ref, getMetadata } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

export const LastGeneration = () => {
  const [lastGeneratedDate, setLastGeneratedDate] = useState<Date | null>(null);
  const auth = getAuth();
  const storage = getStorage(undefined, 'gs://cv-generator-447314.firebasestorage.app');

  useEffect(() => {
    const checkLastGeneration = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const expRef = ref(storage, `${user.uid}/profil/exp.json`);
          const metadata = await getMetadata(expRef);
          setLastGeneratedDate(new Date(metadata.updated));
        } catch (error) {
          console.log("Pas de profil généré");
          setLastGeneratedDate(null);
        }
      }
    };

    checkLastGeneration();
  }, [auth.currentUser]);

  if (!lastGeneratedDate) return null;

  return (
    <p className="text-sm text-muted-foreground">
      Dernière génération le {format(lastGeneratedDate, "dd/MM/yyyy 'à' HH:mm")}
    </p>
  );
};
