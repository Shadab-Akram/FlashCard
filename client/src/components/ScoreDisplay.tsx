import React, { useEffect, useRef, useState } from "react";

interface ScoreDisplayProps {
  correct: number;
  incorrect: number;
  percentage: number;
  isMobile?: boolean;
  animate?: boolean;
}

export default function ScoreDisplay({ 
  correct, 
  incorrect, 
  percentage, 
  isMobile = false,
  animate = false
}: ScoreDisplayProps) {
  const [prevCorrect, setPrevCorrect] = useState(correct);
  const [prevIncorrect, setPrevIncorrect] = useState(incorrect);
  const [prevPercentage, setPrevPercentage] = useState(percentage);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track when values change to trigger animations
  useEffect(() => {
    if ((correct !== prevCorrect || incorrect !== prevIncorrect) && animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevCorrect(correct);
        setPrevIncorrect(incorrect);
        setPrevPercentage(percentage);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setPrevCorrect(correct);
      setPrevIncorrect(incorrect);
      setPrevPercentage(percentage);
    }
  }, [correct, incorrect, percentage, prevCorrect, prevIncorrect, prevPercentage, animate]);

  // Progress bar for percentage
  const ProgressBar = () => (
    <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-primary rounded-full progress-bar ${isAnimating ? 'animate-fill-progress' : ''}`}
        style={{ 
          width: '100%', 
          transform: isAnimating ? `scaleX(0)` : `scaleX(${percentage / 100})`,
        }}
      />
    </div>
  );

  // Renders a counter with animation
  const AnimatedCounter = ({ value, color }: { value: number, color: string }) => {
    return (
      <span className={`font-medium ${color} ${isAnimating ? 'animate-count' : ''}`}>
        {value}
      </span>
    );
  };

  if (isMobile) {
    return (
      <div className="flex items-center space-x-6 md:hidden bg-white rounded-lg p-3 shadow-sm w-full">
        <div className="flex flex-col items-center text-green-500 flex-1 justify-center">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-1"></i>
            <AnimatedCounter value={correct} color="text-green-500" />
          </div>
          <div className="mt-1 w-full">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-green-500 rounded-full progress-bar ${isAnimating ? 'animate-fill-progress' : ''}`}
                style={{ 
                  width: '100%', 
                  transform: `scaleX(${correct / (correct + incorrect || 1)})`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-red-500 flex-1 justify-center">
          <div className="flex items-center">
            <i className="fas fa-times-circle mr-1"></i>
            <AnimatedCounter value={incorrect} color="text-red-500" />
          </div>
          <div className="mt-1 w-full">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-red-500 rounded-full progress-bar ${isAnimating ? 'animate-fill-progress' : ''}`}
                style={{ 
                  width: '100%', 
                  transform: `scaleX(${incorrect / (correct + incorrect || 1)})`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-primary flex-1 justify-center">
          <div className="flex items-center">
            <AnimatedCounter value={percentage} color="text-primary" />
            <span className="text-primary">%</span>
          </div>
          <ProgressBar />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-6">
      <div className="flex items-center text-green-500">
        <i className="fas fa-check-circle mr-1"></i>
        <AnimatedCounter value={correct} color="text-green-500" />
      </div>
      <div className="flex items-center text-red-500">
        <i className="fas fa-times-circle mr-1"></i>
        <AnimatedCounter value={incorrect} color="text-red-500" />
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center text-primary">
          <AnimatedCounter value={percentage} color="text-primary" />
          <span className="text-primary">%</span>
        </div>
        <ProgressBar />
      </div>
    </div>
  );
}
