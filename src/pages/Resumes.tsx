
import { ResumeList } from "@/components/resume/ResumeList";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Resumes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Mes CVs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gérez vos CVs personnalisés basés sur votre profil
            </p>
          </CardHeader>
          <CardContent>
            <ResumeList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resumes;
