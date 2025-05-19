import { useState, useEffect } from "react";

interface AnimatedFeedbackProps {
  isCorrect: boolean | null;
  onAnimationComplete?: () => void;
}

export function AnimatedFeedback({ isCorrect, onAnimationComplete }: AnimatedFeedbackProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isCorrect !== null) {
      setVisible(true);
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 1000); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isCorrect, onAnimationComplete]);
  
  if (isCorrect === null) return null;
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.5s ease-in-out' }}>
      <div className={`text-9xl ${isCorrect ? 'text-green-500' : 'text-red-500'} animate-feedback`}>
        <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
      </div>
    </div>
  );
}