// Adaptive loading screen with smooth progress that never reaches 100% until API responds
// Uses logarithmic progress curve that slows down over time
// No fixed duration - adapts to actual API response time

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: boolean; // Signal from parent that API has responded
}

const LOADING_MESSAGES = [
  { text: "Analyzing your requirements...", minTime: 0 },
  { text: "Understanding your target audience...", minTime: 3 },
  { text: "Identifying key pain points...", minTime: 6 },
  { text: "Structuring functional requirements...", minTime: 9 },
  { text: "Crafting the perfect prompt...", minTime: 12 },
  { text: "Almost there, finalizing details...", minTime: 16 },
];

// Adaptive progress calculation with diminishing returns
const calculateProgress = (elapsedSeconds: number): number => {
  if (elapsedSeconds < 3) {
    // 0-3 seconds: Fast progress to 50%
    return (elapsedSeconds / 3) * 50;
  } else if (elapsedSeconds < 6) {
    // 3-6 seconds: Slower progress to 70%
    return 50 + ((elapsedSeconds - 3) / 3) * 20;
  } else if (elapsedSeconds < 10) {
    // 6-10 seconds: Crawl to 85%
    return 70 + ((elapsedSeconds - 6) / 4) * 15;
  } else if (elapsedSeconds < 15) {
    // 10-15 seconds: Very slow to 92%
    return 85 + ((elapsedSeconds - 10) / 5) * 7;
  } else {
    // 15+ seconds: Barely moves, asymptotically approaches 96%
    const overtime = elapsedSeconds - 15;
    return 92 + (4 * (1 - Math.exp(-overtime / 10)));
  }
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete = false }) => {
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (onComplete && !isCompleting) {
      setIsCompleting(true);
      // Animate to 100% over 500ms
      const currentProgress = progress;
      const progressToGo = 100 - currentProgress;
      const animationDuration = 500;
      const animationStart = Date.now();

      const completeAnimation = setInterval(() => {
        const elapsed = Date.now() - animationStart;
        const animationProgress = Math.min(elapsed / animationDuration, 1);
        // Ease-out animation
        const easedProgress = 1 - Math.pow(1 - animationProgress, 3);
        setProgress(currentProgress + (progressToGo * easedProgress));

        if (animationProgress >= 1) {
          clearInterval(completeAnimation);
          setProgress(100);
        }
      }, 16); // ~60fps

      return () => clearInterval(completeAnimation);
    }
  }, [onComplete, isCompleting, progress]);

  useEffect(() => {
    if (isCompleting) return; // Don't update progress if completing

    // Update progress based on elapsed time
    const progressInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const newProgress = calculateProgress(elapsedSeconds);
      setProgress(newProgress);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(progressInterval);
  }, [startTime, isCompleting]);

  useEffect(() => {
    if (isCompleting) return; // Don't update messages if completing

    // Update message based on elapsed time
    const messageInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;

      // Find the appropriate message based on elapsed time
      for (let i = LOADING_MESSAGES.length - 1; i >= 0; i--) {
        if (elapsedSeconds >= LOADING_MESSAGES[i].minTime) {
          setCurrentMessageIndex(i);
          break;
        }
      }
    }, 500); // Check every 500ms

    return () => clearInterval(messageInterval);
  }, [startTime, isCompleting]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
      <div className="relative mb-8">
        <Loader2 className="text-blue-400 animate-spin" size={64} />
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        {isCompleting ? "Prompt ready!" : "Crafting your perfect prompt..."}
      </h2>

      <div className="w-full max-w-md mb-8">
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 text-center mt-2">{Math.round(progress)}%</p>
      </div>

      <div className="h-20 flex items-center justify-center">
        <p
          key={currentMessageIndex}
          className="text-gray-300 text-center animate-fadeIn max-w-md"
        >
          {LOADING_MESSAGES[currentMessageIndex].text}
        </p>
      </div>

      <p className="text-blue-400 text-center mt-4 max-w-md">
        Our AI is analyzing your answers and building a detailed prompt that Bolt will love.
      </p>

      <p className="text-sm text-gray-500 text-center mt-2">
        {isCompleting ? "Loading your results..." : "Get ready to build something amazing!"}
      </p>
    </div>
  );
};
