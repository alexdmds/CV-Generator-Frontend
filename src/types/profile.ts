
export interface HeadSection {
  name: string;
  phone: string;
  mail: string;
  title: string;
  linkedin_url?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  dates: string;
  full_descriptions: string;
}

export interface Education {
  title: string;
  university: string;
  dates: string;
  full_descriptions: string;
}

export interface Language {
  language: string;
  level: string;
}

export interface Skill {
  skills: string;
  category_name: string;
}

export interface Profile {
  head: HeadSection;
  experiences: Experience[];
  educations: Education[];
  skills: string;
  hobbies: string;
  languages: string;
}

// Types pour les CVs générés
export interface CVEducation {
  title: string;
  description: string;
  dates: string;
  university: string;
  location: string;
}

export interface CVExperience {
  company: string;
  title: string;
  bullets: string[];
  dates: string;
  location: string;
}

export interface CVSectionNames {
  experience_section_name: string;
  hobbies_section_name: string;
  languages_section_name: string;
  skills_section_name: string;
  education_section_name: string;
}

export interface CVData {
  educations: CVEducation[];
  lang_of_cv: string;
  hobbies: string;
  languages: Language[];
  phone: string;
  mail: string;
  title: string;
  section_names: CVSectionNames;
  skills: Skill[];
  experiences: CVExperience[];
  name: string;
}

export interface CV {
  cv_name: string;
  job_raw?: string;
  job_sumup?: string;
  cv_data: {
    educations: Array<{
      title: string;
      description: string;
      dates: string;
      university: string;
      location: string;
    }>;
    experiences: Array<{
      company: string;
      title: string;
      bullets: string[];
      dates: string;
      location: string;
    }>;
    lang_of_cv: string;
    hobbies: string;
    languages: Array<{
      language: string;
      level: string;
    }>;
    phone: string;
    mail: string;
    title: string;
    section_names: {
      experience_section_name: string;
      hobbies_section_name: string;
      languages_section_name: string;
      skills_section_name: string;
      education_section_name: string;
    };
    skills: Array<{
      skills: string[];
      category_name: string;
    }>;
    name: string;
  };
  user_id?: string;
  cv_url?: string;
  id?: string;
}
