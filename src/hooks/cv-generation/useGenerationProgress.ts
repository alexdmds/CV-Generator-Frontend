
import { useState } from "react";
import { emitGenerationEvent } from "./generationEvents";

export function useGenerationProgress() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateSmoothProgress = (
    initialProgress: number, 
    targetProgress: number, 
    duration: number, 
    updateInterval: number,
    cvId: string | null,
    cvName: string | null
  ) => {
    const steps = Math.floor(duration / updateInterval);
    const increment = (targetProgress - initialProgress) / steps;
    let currentStep = 0;
    let currentProgress = initialProgress;
    
    const interval = setInterval(() => {
      currentStep++;
      currentProgress += increment;
      
      const randomFactor = 0.2;
      const variation = increment * randomFactor * (Math.random() - 0.5);
      
      currentProgress = Math.min(Math.max(currentProgress + variation, initialProgress), targetProgress);
      
      emitGenerationEvent('cv-generation-progress', { 
        progress: currentProgress,
        cvId: cvId
      });
      
      if (currentStep >= steps || currentProgress >= targetProgress) {
        clearInterval(interval);
      }
    }, updateInterval);
    
    return interval;
  };

  const startGenerationProgress = (cvId: string | null, cvName: string | null) => {
    setIsGenerating(true);
    setProgress(5);
    
    emitGenerationEvent('cv-generation-start', { 
      progress: 5, 
      cvId,
      cvName
    });
    
    const progressIntervals: NodeJS.Timeout[] = [];
    
    progressIntervals.push(generateSmoothProgress(5, 30, 5000, 200, cvId, cvName));
    
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(30, 50, 8000, 200, cvId, cvName));
    }, 5000);
    
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(50, 70, 8000, 200, cvId, cvName));
    }, 13000);
    
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(70, 85, 6000, 200, cvId, cvName));
    }, 21000);
    
    return progressIntervals;
  };

  const completeGenerationProgress = (cvId: string | null, success: boolean, error?: any) => {
    if (success) {
      emitGenerationEvent('cv-generation-progress', { 
        progress: 95,
        cvId
      });
      
      setTimeout(() => {
        emitGenerationEvent('cv-generation-complete', { 
          progress: 100,
          cvId,
          success: true
        });
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
    } else {
      emitGenerationEvent('cv-generation-complete', { 
        progress: 100,
        cvId,
        success: false,
        error
      });
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return {
    isGenerating,
    progress,
    startGenerationProgress,
    completeGenerationProgress
  };
}
