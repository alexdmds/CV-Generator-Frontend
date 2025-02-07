
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Navbar = () => {
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl font-semibold text-gray-800">
          Generateur de CV
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </nav>
  );
};
