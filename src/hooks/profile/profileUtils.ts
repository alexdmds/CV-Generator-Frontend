
import { Profile } from "@/types/profile";

export const emptyProfile: Profile = {
  head: {
    name: "",
    phone: "",
    mail: "",
    title: "",
    linkedin_url: ""
  },
  experiences: [],
  educations: [],
  skills: "",
  hobbies: "",
  languages: ""
};

// Create a deep copy of an object
export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
