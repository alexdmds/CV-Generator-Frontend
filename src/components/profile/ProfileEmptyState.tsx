
import { Card, CardContent } from "@/components/ui/card";

export const ProfileEmptyState = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mt-6">
      <CardContent className="pt-6">
        <div className="flex justify-center">
          <div className="text-gray-500">Aucun profil disponible. Veuillez en générer un.</div>
        </div>
      </CardContent>
    </Card>
  );
};
