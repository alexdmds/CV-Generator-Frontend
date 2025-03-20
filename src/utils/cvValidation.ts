
/**
 * Validates if CV information is complete enough to save
 */
export const validateCV = (cvName: string, jobDescription: string = ""): { valid: boolean; message?: string } => {
  if (!cvName.trim()) {
    return { 
      valid: false, 
      message: "Veuillez saisir un nom pour votre CV" 
    };
  }

  // For a complete CV, we also need job description, but it's optional for initial save
  return { valid: true };
};
