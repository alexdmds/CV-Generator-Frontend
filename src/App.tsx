
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Resumes from "./pages/Resumes";
import ResumeForm from "./pages/ResumeForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    // Définir la persistance sur LOCAL
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const token = await user.getIdToken();
            localStorage.setItem('firebase_token', token);
            setEmailVerified(user.emailVerified);
          } else {
            setEmailVerified(false);
          }
          setUser(user);
          setLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Erreur lors de la configuration de la persistance:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Chargement...</div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={!user ? <Login /> : (emailVerified ? <Navigate to="/profile" /> : <Login />)} />
            <Route path="/profile" element={user && emailVerified ? <Profile /> : <Navigate to="/" />} />
            <Route path="/resumes" element={user && emailVerified ? <Resumes /> : <Navigate to="/" />} />
            <Route path="/resumes/:id" element={user && emailVerified ? <ResumeForm /> : <Navigate to="/" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
