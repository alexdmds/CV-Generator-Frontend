
import { useState } from "react";

export function useFormData() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvName, setCvName] = useState("");

  return {
    jobDescription,
    setJobDescription,
    cvName,
    setCvName
  };
}
