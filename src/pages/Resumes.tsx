
import { ResumeList } from "@/components/resume/ResumeList";
import { Navbar } from "@/components/layout/Navbar";

const Resumes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <ResumeList />
      </div>
    </div>
  );
};

export default Resumes;
