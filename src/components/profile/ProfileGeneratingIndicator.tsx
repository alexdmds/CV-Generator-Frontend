
import { Loader2 } from "lucide-react";

export const ProfileGeneratingIndicator = ({ message = "Génération du profil en cours..." }) => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{message}</h3>
      <p className="text-gray-500 mt-2 text-center">
        Veuillez patienter. Cette opération peut prendre jusqu'à 1 minute 30.
        <br />
        Vos données sont en cours de traitement.
      </p>
    </div>
  );
};
