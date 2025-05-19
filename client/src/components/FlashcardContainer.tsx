import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FlashcardResponse } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isAnswering, setIsAnswering] = useState(false);
  const [difficultyClass, setDifficultyClass] = useState("");
  const [difficultyLabel, setDifficultyLabel] = useState("");
  const [difficultyIcon, setDifficultyIcon] = useState("");

  // Handle the know/don't know actions with animation
  const handleResponse = async (isKnown: boolean) => {
    setIsAnswering(true);
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 300));
    if (isKnown) {
      onKnow();
    } else {
      onDontKnow();
    }
    setIsAnswering(false);
  };

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
  const subjectDisplay = flashcard.subject?.replace(/_/g, " ") || "General";
  const subjectFirstChar = subjectDisplay.charAt(0).toUpperCase();
  const subjectRest = subjectDisplay.slice(1);
  const formattedSubject = subjectFirstChar + subjectRest;

  const classLevelDisplay = 
    !flashcard.classLevel ? "General" :
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
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(flashcard.answer);
      window.speechSynthesis.speak(speech);
    }
  };

  // Define color classes based on difficulty
  let textColorClass = "text-green-500";
  let bgColorClass = "bg-green-500";
  
  if (flashcard.difficulty === "medium") {
    textColorClass = "text-yellow-500";
    bgColorClass = "bg-yellow-500";
  } else if (flashcard.difficulty === "hard") {
    textColorClass = "text-red-500";
    bgColorClass = "bg-red-500";
  }

  return (
    <div className="w-full mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={flashcard.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnswering ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {/* Flashcard with flip animation */}
          <div className={`flip-card w-full h-[400px] sm:h-[500px] ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
            <div className="flip-card-inner relative w-full h-full">
              {/* Front of card (Question) */}
              <div className="flip-card-front absolute w-full h-full bg-card rounded-xl shadow-lg border border-muted p-6 flex flex-col">
                <div className="text-sm text-muted-foreground mb-4 flex justify-between items-center">
                  <span className="font-medium">{formattedSubject} - {classLevelDisplay}</span>
                  <span className={`flex items-center ${textColorClass} font-medium`}>
                    <i className={`fas fa-${difficultyIcon} mr-1`}></i> {difficultyLabel}
                  </span>
                </div>
                
                <div className="flex-grow flex items-center justify-center text-center p-4">
                  <h3 className="text-2xl sm:text-3xl font-medium leading-relaxed">
                    {flashcard.question}
                  </h3>
                </div>
                
                <div className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                  <i className="fas fa-hand-pointer"></i>
                  <p>Tap to reveal answer</p>
                </div>
              </div>
              
              {/* Back of card (Answer) */}
              <div className="flip-card-back absolute w-full h-full bg-card rounded-xl shadow-lg border border-muted p-6 flex flex-col">
                <div className="text-sm text-muted-foreground mb-4 flex justify-between items-center">
                  <span className="font-medium flex items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-500"></i>
                    Answer
                  </span>
                  <button 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={handleSpeak}
                    title="Listen to answer"
                  >
                    <i className="fas fa-volume-up"></i>
                  </button>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                  <div className="w-full max-h-full overflow-y-auto px-4">
                    <div className="bg-muted bg-opacity-50 rounded-lg p-6">
                      <p className="text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap">
                        {flashcard.answer}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                  <i className="fas fa-undo"></i>
                  <p>Tap to see question</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <Button 
              variant="outline"
              className="flex-1 bg-opacity-10 text-red-500 border border-red-500 border-opacity-30 rounded-lg py-3 font-medium hover:bg-opacity-20 transition-colors"
              onClick={() => handleResponse(false)}
              disabled={isAnswering}
            >
              <i className="fas fa-times-circle mr-2"></i>
              <span>Don't Know</span>
            </Button>
            <Button 
              variant="outline"
              className="flex-1 bg-opacity-10 text-green-500 border border-green-500 border-opacity-30 rounded-lg py-3 font-medium hover:bg-opacity-20 transition-colors"
              onClick={() => handleResponse(true)}
              disabled={isAnswering}
            >
              <i className="fas fa-check-circle mr-2"></i>
              <span>Know</span>
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}