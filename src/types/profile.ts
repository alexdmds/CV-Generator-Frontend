
export interface HeadSection {
  name: string;
  phone: string;
  email: string;
  general_title: string;
}

export interface Experience {
  post: string;
  company: string;
  location: string;
  dates: string;
  description: string;
}

export interface Education {
  intitule: string;
  etablissement: string;
  dates: string;
  description: string;
}

export interface SkillsSection {
  description: string;
}

export interface HobbiesSection {
  description: string;
}

export interface Profile {
  head: HeadSection;
  experiences: {
    experiences: Experience[];
  };
  education: {
    educations: Education[];
  };
  skills: SkillsSection;
  hobbies: HobbiesSection;
}
