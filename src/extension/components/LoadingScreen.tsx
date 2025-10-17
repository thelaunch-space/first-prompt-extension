// Enhanced loading screen with sequential messages and progress animation

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

const LOADING_MESSAGES = [
  { text: "Analyzing your requirements...", duration: 2000 },
  { text: "Understanding your target audience...", duration: 2000 },
  { text: "Identifying key pain points...", duration: 2000 },
  { text: "Structuring functional requirements...", duration: 2500 },
  { text: "Crafting the perfect prompt...", duration: 3000 },
  { text: "Almost there...", duration: 2000 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentMessageIndex >= LOADING_MESSAGES.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const currentMessage = LOADING_MESSAGES[currentMessageIndex];
    const progressIncrement = 100 / LOADING_MESSAGES.length;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = (currentMessageIndex + 1) * progressIncrement;
        const newProgress = prev + 2;
        return newProgress >= targetProgress ? targetProgress : newProgress;
      });
    }, 50);

    const messageTimer = setTimeout(() => {
      setCurrentMessageIndex((prev) => prev + 1);
    }, currentMessage.duration);

    return () => {
      clearTimeout(messageTimer);
      clearInterval(progressInterval);
    };
  }, [currentMessageIndex, onComplete]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
      <div className="relative mb-8">
        <Loader2 className="text-blue-400 animate-spin" size={64} />
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Crafting your perfect prompt...
      </h2>

      <div className="w-full max-w-md mb-8">
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
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
          {currentMessageIndex < LOADING_MESSAGES.length
            ? LOADING_MESSAGES[currentMessageIndex].text
            : ""}
        </p>
      </div>

      <p className="text-blue-400 text-center mt-4 max-w-md">
        Our AI is analyzing your answers and building a detailed prompt that Bolt will love.
      </p>

      <p className="text-sm text-gray-500 text-center mt-2">
        Get ready to build something amazing!
      </p>
    </div>
  );
};
