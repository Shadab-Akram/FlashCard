import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FlashcardResponse } from "@shared/schema";

interface FlashcardContainerProps {
  flashcard: FlashcardResponse;
  isFlipped: boolean;
  onFlip: () => void;
  onKnow: () => void;
  onDontKnow: () => void;
}

export function FlashcardContainer({
  flashcard,
  isFlipped,
  onFlip,
  onKnow,
  onDontKnow,
}: FlashcardContainerProps) {
  const [difficultyClass, setDifficultyClass] = useState("");
  const [difficultyLabel, setDifficultyLabel] = useState("");
  const [difficultyIcon, setDifficultyIcon] = useState("");

  // Set difficulty styling based on flashcard difficulty
  useEffect(() => {
    if (flashcard.difficulty === "easy") {
      setDifficultyClass("difficulty-easy");
      setDifficultyLabel("Easy");
      setDifficultyIcon("battery-quarter");
    } else if (flashcard.difficulty === "medium") {
      setDifficultyClass("difficulty-medium");
      setDifficultyLabel("Medium");
      setDifficultyIcon("battery-half");
    } else if (flashcard.difficulty === "hard") {
      setDifficultyClass("difficulty-hard");
      setDifficultyLabel("Hard");
      setDifficultyIcon("battery-full");
    }
  }, [flashcard.difficulty]);

  // Get the subject and class level from the flashcard
  const subjectDisplay = flashcard.subject.replace(/_/g, " ");
  const subjectFirstChar = subjectDisplay.charAt(0).toUpperCase();
  const subjectRest = subjectDisplay.slice(1);
  const formattedSubject = subjectFirstChar + subjectRest;

  const classLevelDisplay = 
    flashcard.classLevel === "college" 
      ? "College Level" 
      : `${flashcard.classLevel}${
          flashcard.classLevel === "1" 
            ? "st" 
            : flashcard.classLevel === "2" 
              ? "nd" 
              : flashcard.classLevel === "3" 
                ? "rd" 
                : "th"
        } Class`;

  // Speak the answer text
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(flashcard.answer);
      window.speechSynthesis.speak(speech);
    }
  };

  // Define color classes based on difficulty
  let textColorClass = "text-success";
  let bgColorClass = "bg-success";
  
  if (flashcard.difficulty === "medium") {
    textColorClass = "text-warning";
    bgColorClass = "bg-warning";
  } else if (flashcard.difficulty === "hard") {
    textColorClass = "text-error";
    bgColorClass = "bg-error";
  }

  return (
    <div className="w-full mb-8">
      {/* Flashcard with flip animation */}
      <div className={`flip-card w-full h-64 sm:h-80 ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        <div className="flip-card-inner relative w-full h-full">
          {/* Front of card (Question) */}
          <div className={`flip-card-front absolute w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col ${difficultyClass}`}>
            <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
              <span>{formattedSubject} - {classLevelDisplay}</span>
              <span className={`flex items-center ${textColorClass}`}>
                <i className={`fas fa-${difficultyIcon} mr-1`}></i> {difficultyLabel}
              </span>
            </div>
            
            <div className="flex-grow flex items-center justify-center text-center">
              <h3 className="text-xl sm:text-2xl font-medium text-gray-800">{flashcard.question}</h3>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Tap to reveal answer</p>
            </div>
          </div>
          
          {/* Back of card (Answer) */}
          <div className={`flip-card-back absolute w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col ${difficultyClass}`}>
            <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
              <span>Answer</span>
              <button className="text-gray-400 hover:text-gray-600" onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}>
                <i className="fas fa-volume-up"></i>
              </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center overflow-y-auto">
              <div className="text-gray-800">
                <p className="text-lg sm:text-xl">{flashcard.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Buttons */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Button 
          variant="outline"
          className="flex-1 bg-error bg-opacity-10 border border-error border-opacity-30 text-error rounded-lg py-3 font-medium hover:bg-opacity-20 transition-colors"
          onClick={onDontKnow}
        >
          <i className="fas fa-times-circle mr-2"></i>
          <span>Don't Know</span>
        </Button>
        <Button 
          variant="outline"
          className="flex-1 bg-success bg-opacity-10 border border-success border-opacity-30 text-success rounded-lg py-3 font-medium hover:bg-opacity-20 transition-colors"
          onClick={onKnow}
        >
          <i className="fas fa-check-circle mr-2"></i>
          <span>Know</span>
        </Button>
      </div>
    </div>
  );
}
