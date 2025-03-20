
import { CV, Profile } from "@/types/profile";

/**
 * Creates a new CV object with the required structure
 */
export const createCVObject = (cvName: string, jobDescription: string, userProfile: Partial<Profile> = {}): CV => {
  console.log("Creating new CV object with name:", cvName);
  
  return {
    job_raw: jobDescription,
    cv_name: cvName,
    cv_data: {
      educations: [],
      lang_of_cv: "français",
      hobbies: userProfile.hobbies || "",
      languages: [],
      phone: userProfile.head?.phone || "",
      mail: userProfile.head?.mail || "",
      title: userProfile.head?.title || "",
      sections_name: {
        experience_section_name: "Expérience professionnelle",
        Hobbies_section: "Centres d'intérêt",
        languages_section_name: "Langues",
        skills_section_name: "Compétences",
        education_section_name: "Formation"
      },
      skills: [],
      experiences: [],
      name: userProfile.head?.name || ""
    }
  };
};
