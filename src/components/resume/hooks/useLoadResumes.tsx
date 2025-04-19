
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/components/auth/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CV } from "@/types/profile";

export const useLoadResumes = () => {
  const [resumes, setResumes] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        setResumes([]);
        return;
      }

      console.log("Loading CVs for user:", user.uid);
      
      // Modified query to avoid requiring a composite index
      // Just filter by user_id without the orderBy
      const q = query(
        collection(db, "cvs"),
        where("user_id", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let loadedResumes: CV[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedResumes.push({
          ...data,
          id: doc.id,
        } as CV);
      });

      // Sort locally instead of in the query
      loadedResumes = loadedResumes.sort((a, b) => {
        // If creation_date exists, use it for sorting
        if (a.creation_date && b.creation_date) {
          return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime();
        }
        // Fallback if creation_date is not available
        return 0;
      });

      console.log(`Loaded ${loadedResumes.length} CVs`);
      setResumes(loadedResumes);
    } catch (error) {
      console.error("Error loading resumes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction explicite pour rafraîchir la liste de CV
  const refreshResumes = useCallback(() => {
    console.log("Refreshing resume list");
    loadResumes();
  }, [loadResumes]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadResumes();
      } else {
        setResumes([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadResumes]);

  return {
    resumes,
    setResumes,
    isLoading,
    refreshResumes
  };
};
