
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
  full_description: string;
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
  Hobbies_section: string;
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
  sections_name: CVSectionNames;
  skills: Skill[];
  experiences: CVExperience[];
  name: string;
}

export interface CV {
  job_raw: string;
  cv_name: string;
  cv_data: CVData;
}
