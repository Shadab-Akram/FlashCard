import React from "react";

interface ScoreDisplayProps {
  correct: number;
  incorrect: number;
  percentage: number;
  isMobile?: boolean;
}

export default function ScoreDisplay({ 
  correct, 
  incorrect, 
  percentage, 
  isMobile = false 
}: ScoreDisplayProps) {
  if (isMobile) {
    return (
      <div className="flex items-center space-x-6 md:hidden bg-white rounded-lg p-3 shadow-sm w-full">
        <div className="flex items-center text-success flex-1 justify-center">
          <i className="fas fa-check-circle mr-1"></i>
          <span className="font-medium">{correct}</span>
        </div>
        <div className="flex items-center text-error flex-1 justify-center">
          <i className="fas fa-times-circle mr-1"></i>
          <span className="font-medium">{incorrect}</span>
        </div>
        <div className="flex items-center text-gray-600 flex-1 justify-center">
          <i className="fas fa-percentage mr-1"></i>
          <span className="font-medium">{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <div className="flex items-center text-success">
        <i className="fas fa-check-circle mr-1"></i>
        <span className="font-medium">{correct}</span>
      </div>
      <div className="flex items-center text-error">
        <i className="fas fa-times-circle mr-1"></i>
        <span className="font-medium">{incorrect}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <i className="fas fa-percentage mr-1"></i>
        <span className="font-medium">{percentage}%</span>
      </div>
    </div>
  );
}
