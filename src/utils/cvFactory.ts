import { Profile, CV, CVData, CVEducation, CVExperience, Language, Skill } from "@/types/profile";

export const createCVFromProfile = (profile: Profile, jobRaw: string, cvName: string, language: string = "français"): CV => {
  // Transform educations
  const educations = profile.educations.map(edu => ({
    title: edu.title,
    description: edu.description,
    dates: edu.dates,
    university: edu.university,
    location: "" // This field needs to be filled by user
  }));

  // Transform experiences
  const experiences = profile.experiences.map(exp => ({
    company: exp.company,
    title: exp.title,
    bullets: exp.description.split("\n").filter(bullet => bullet.trim() !== ""), // Changed from full_descriptions to description
    dates: exp.dates,
    location: exp.location
  }));

  // Create section names based on language
  const section_names = {
    experience_section_name: language === "français" ? "Expérience professionnelle" : "Professional experience",
    hobbies_section_name: language === "français" ? "Centres d'intérêt" : "Hobbies",
    languages_section_name: language === "français" ? "Langues" : "Languages",
    skills_section_name: language === "français" ? "Compétences" : "Skills",
    education_section_name: language === "français" ? "Formation" : "Education"
  };

  // Parse languages
  const languageList: Language[] = parseLanguages(profile.languages);
  
  // Parse skills
  const skillsList: Skill[] = parseSkills(profile.skills);

  // Create CV data
  const cvData: any = {
    educations,
    lang_of_cv: language,
    hobbies: profile.hobbies,
    languages: languageList,
    phone: profile.head.phone,
    mail: profile.head.mail,
    title: profile.head.title,
    section_names,
    skills: skillsList,
    experiences,
    name: profile.head.name
  };

  return {
    job_raw: jobRaw,
    cv_name: cvName,
    cv_data: cvData
  };
};

// Helper functions for parsing strings into structured data
function parseLanguages(languagesString: string): Language[] {
  if (!languagesString || languagesString.trim() === "") {
    return [];
  }
  
  // Simple parsing: one language per line, with format "Language: Level"
  const lines = languagesString.split("\n").filter(line => line.trim() !== "");
  
  return lines.map(line => {
    const parts = line.split(":");
    if (parts.length > 1) {
      return {
        language: parts[0].trim(),
        level: parts.slice(1).join(":").trim()
      };
    } else {
      return {
        language: line.trim(),
        level: ""
      };
    }
  });
}

function parseSkills(skillsString: string): Skill[] {
  if (!skillsString || skillsString.trim() === "") {
    return [];
  }
  
  // Convert the skills string to an array format
  const skillLines = skillsString.split("\n")
    .filter(line => line.trim() !== "")
    .map(line => line.trim());
  
  // For simplicity, we'll create one category with all skills as an array
  return [{
    category_name: "Compétences techniques",
    skills: skillLines // Now we're returning skills as string[]
  }];
}
