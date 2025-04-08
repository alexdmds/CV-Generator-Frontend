
export const ProfileGeneratingIndicator = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow animate-pulse">
      <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-200 rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-700">Génération du profil en cours...</h3>
      <p className="text-gray-500 mt-2 text-center">
        Veuillez patienter. Cette opération peut prendre jusqu'à 1 minute 30.
        <br />
        Vos données sont en cours de traitement.
      </p>
    </div>
  );
};
