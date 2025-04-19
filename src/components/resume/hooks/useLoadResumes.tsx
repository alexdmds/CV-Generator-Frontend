
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/components/auth/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
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
      
      const q = query(
        collection(db, "cvs"),
        where("user_id", "==", user.uid),
        orderBy("creation_date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const loadedResumes: CV[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedResumes.push({
          ...data,
          id: doc.id,
        } as CV);
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
