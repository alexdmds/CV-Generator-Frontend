
import { useGenerateCV } from "./cv-generation/useGenerateCV";
import { useGenerationProgress } from "./cv-generation/useGenerationProgress";

export function useCVGenerationProcess() {
  const { isGenerating, generateCV } = useGenerateCV();
  const { progress } = useGenerationProgress();

  return {
    isGenerating,
    progress,
    generateCV
  };
}
