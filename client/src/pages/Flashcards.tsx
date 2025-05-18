import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlashcardContainer } from "@/components/FlashcardContainer";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-mobile";

export default function Flashcards() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Array<{ flashcardId: number; isCorrect: boolean }>>([]);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  
  // Stats for the current session
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    percentage: 0,
  });

  // Fetch flashcards for current session
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/study-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      // If we already have data stored in sessionStorage, use it
      const storedData = sessionStorage.getItem(`flashcards-${sessionId}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // Otherwise fetch from API
      const response = await fetch(`/api/session-stats/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch session data");
      }
      return await response.json();
    },
  });

  // Submit results and get next round
  const submitRoundMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      results: typeof results;
      round: number;
      totalRounds: number;
    }) => {
      const response = await apiRequest("POST", "/api/round-results", data);
      return await response.json();
    },
    onSuccess: (data) => {
      // If session completed, go to results page
      if (data.completed) {
        setLocation(`/results/${sessionId}`);
        return;
      }
      
      // Otherwise, update state for the next round
      setResults([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setRound(data.round);
      
      // Save flashcards to sessionStorage
      sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(data));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit round results. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting round results:", error);
    },
  });

  // Effect to update stats when results change
  useEffect(() => {
    if (results.length > 0) {
      const correctCount = results.filter((r) => r.isCorrect).length;
      const incorrectCount = results.length - correctCount;
      const percentage = Math.round((correctCount / results.length) * 100);
      
      setStats({
        correct: correctCount,
        incorrect: incorrectCount,
        percentage,
      });
    }
  }, [results]);

  // Effect to save session data to sessionStorage
  useEffect(() => {
    if (data) {
      setRound(data.round || 1);
      setTotalRounds(data.totalRounds || 1);
      sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(data));
    }
  }, [data, sessionId]);

  // Handle user responses (Know/Don't Know)
  const handleResponse = (isCorrect: boolean) => {
    if (!data || !data.flashcards || currentIndex >= data.flashcards.length) return;
    
    // Add result
    const flashcardId = data.flashcards[currentIndex].id;
    setResults([...results, { flashcardId, isCorrect }]);
    
    // Move to next card
    if (currentIndex < data.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Submit round results when all cards have been answered
      submitRoundMutation.mutate({
        sessionId,
        results: [...results, { flashcardId, isCorrect }],
        round,
        totalRounds,
      });
    }
  };

  // Handle navigation between cards
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (data && data.flashcards && currentIndex < data.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-400 mb-4"></i>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data || !data.flashcards) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <i className="fas fa-exclamation-circle text-4xl text-error mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Flashcards</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error 
              ? error.message 
              : "Failed to load flashcards. Please try again."}
          </p>
          <Button onClick={() => setLocation("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-brain text-primary-400 text-2xl"></i>
            <h1 className="text-xl font-bold text-gray-800">FlashLearn</h1>
          </div>
          
          {!isMobile && (
            <ScoreDisplay 
              correct={stats.correct}
              incorrect={stats.incorrect}
              percentage={stats.percentage}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-start">
        {/* Mobile Score Display */}
        {isMobile && (
          <div className="mb-6 w-full">
            <ScoreDisplay 
              correct={stats.correct}
              incorrect={stats.incorrect}
              percentage={stats.percentage}
              isMobile
            />
          </div>
        )}

        <div className="max-w-4xl w-full">
          {/* Progress Tracking */}
          <div className="mb-6 w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">
                Progress: <span>{currentIndex + 1}</span>/<span>{data.flashcards.length}</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Round: <span>{round}</span>/<span>{totalRounds}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-400 h-2.5 rounded-full" 
                style={{ width: `${((currentIndex + 1) / data.flashcards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          {data.flashcards[currentIndex] && (
            <FlashcardContainer
              flashcard={data.flashcards[currentIndex]}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              onKnow={() => handleResponse(true)}
              onDontKnow={() => handleResponse(false)}
            />
          )}

          {/* Card Navigation */}
          <div className="flex justify-between mt-6">
            <button 
              className={`text-gray-500 hover:text-gray-700 flex items-center space-x-1 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm">Previous</span>
            </button>
            <button 
              className={`text-gray-500 hover:text-gray-700 flex items-center space-x-1 ${currentIndex === data.flashcards.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNext}
              disabled={currentIndex === data.flashcards.length - 1}
            >
              <span className="text-sm">Next</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
