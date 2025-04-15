
import { useCallback } from "react";

/**
 * Hook for emitting CV generation progress events
 */
export function useCVGenerationEvents() {
  // Function to emit generation events
  const emitGenerationEvent = useCallback((eventName: string, data: any = {}) => {
    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: true 
    });
    window.dispatchEvent(event);
  }, []);

  // Generate a smooth progress simulation
  const generateSmoothProgress = useCallback((
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
      
      // Add slight random variation to appear natural
      const randomFactor = 0.2; // 20% max variation
      const variation = increment * randomFactor * (Math.random() - 0.5);
      
      currentProgress = Math.min(Math.max(currentProgress + variation, initialProgress), targetProgress);
      
      // Emit progress event
      emitGenerationEvent('cv-generation-progress', { 
        progress: currentProgress,
        cvId: cvId
      });
      
      // Stop interval once target is reached
      if (currentStep >= steps || currentProgress >= targetProgress) {
        clearInterval(interval);
      }
    }, updateInterval);
    
    return interval;
  }, [emitGenerationEvent]);

  // Function to start generation progress
  const startGenerationProgress = useCallback((cvId: string | null, cvName: string | null) => {
    // Initialize progress
    emitGenerationEvent('cv-generation-start', { 
      progress: 5, 
      cvId,
      cvName
    });
    
    // Initialize progress intervals array
    const progressIntervals: NodeJS.Timeout[] = [];
    
    // Step 1: 5% -> 30% (job analysis)
    progressIntervals.push(generateSmoothProgress(5, 30, 5000, 200, cvId, cvName));
    
    // Step 2: 30% -> 50% (profile adaptation)
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(30, 50, 8000, 200, cvId, cvName));
    }, 5000);
    
    // Step 3: 50% -> 70% (formatting)
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(50, 70, 8000, 200, cvId, cvName));
    }, 13000);
    
    // Step 4: 70% -> 85% (finalization)
    setTimeout(() => {
      progressIntervals.push(generateSmoothProgress(70, 85, 6000, 200, cvId, cvName));
    }, 21000);
    
    return progressIntervals;
  }, [generateSmoothProgress, emitGenerationEvent]);

  // Function to complete generation progress
  const completeGenerationProgress = useCallback((cvId: string | null, success: boolean, error?: any) => {
    if (success) {
      // Final progress
      emitGenerationEvent('cv-generation-progress', { 
        progress: 95,
        cvId
      });
      
      setTimeout(() => {
        // Complete event
        emitGenerationEvent('cv-generation-complete', { 
          progress: 100,
          cvId,
          success: true
        });
      }, 1000);
    } else {
      // Failure event
      emitGenerationEvent('cv-generation-complete', { 
        progress: 100,
        cvId,
        success: false,
        error
      });
    }
  }, [emitGenerationEvent]);

  return {
    emitGenerationEvent,
    generateSmoothProgress,
    startGenerationProgress,
    completeGenerationProgress
  };
}
