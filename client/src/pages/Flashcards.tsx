import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlashcardContainer } from "@/components/FlashcardContainer";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  subject: string;
  difficulty: string;
  isCorrect?: boolean;
}

interface Result {
  flashcardId: number;
  isCorrect: boolean;
}

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

  // Add state for confirmation dialog
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Fetch flashcards for current session
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/study-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      // Get data from sessionStorage
      const storedData = sessionStorage.getItem(`flashcards-${sessionId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setRound(data.round || 1);
        setTotalRounds(data.totalRounds || 1);
        return data;
      }
      
      throw new Error("No session data found");
    }
  });

  // Helper function to save to session storage
  const saveToSessionStorage = (sessionId: string, data: any) => {
    try {
      sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to session storage:", e);
    }
  };

  // Submit results and get next round
  const submitRoundMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      results: typeof results;
      round: number;
      totalRounds: number;
    }) => {
      // Check if this is a mock session
      const isMockSession = data.sessionId.startsWith('mock-session-');
      
      if (isMockSession) {
        // For mock sessions, process locally
        return {
          completed: data.round >= data.totalRounds,
          round: data.round < data.totalRounds ? data.round + 1 : data.round,
          message: "Round results saved locally"
        };
      }
      
      try {
        const response = await apiRequest("POST", "/api/round-results", data);
        return await response.json();
      } catch (error) {
        console.error("API error in round submission:", error);
        // Fallback to local processing if API fails
        return {
          completed: data.round >= data.totalRounds,
          round: data.round < data.totalRounds ? data.round + 1 : data.round,
          message: "Server error, results saved locally"
        };
      }
    },
    onSuccess: (data) => {
      // If session completed, go to results page
      if (data.completed) {
        // Store final results in sessionStorage for the results page
        saveToSessionStorage(`results-${sessionId}`, {
          flashcards: results,
          stats: stats
        });
        setLocation(`/results/${sessionId}`);
        return;
      }
      
      // Otherwise, update state for the next round
      setResults([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setRound(data.round);
      
      toast({
        title: "Round Complete",
        description: `Round ${data.round - 1} completed! Starting round ${data.round}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit round results. Using local storage as backup.",
        variant: "destructive",
      });
      console.error("Error submitting round results:", error);
      
      // Try to continue anyway using local data
      const nextRound = round < totalRounds ? round + 1 : round;
      const completed = round >= totalRounds;
      
      if (completed) {
        saveToSessionStorage(`results-${sessionId}`, {
          flashcards: results,
          stats: stats
        });
        setLocation(`/results/${sessionId}`);
      } else {
        setResults([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setRound(nextRound);
      }
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
    const newResults = [...results, { flashcardId, isCorrect }];
    setResults(newResults);
    
    // Calculate if this was the last card
    const isLastCard = currentIndex === data.flashcards.length - 1;
    const isLastRound = round >= totalRounds;

    if (isLastCard) {
      if (isLastRound) {
        // Calculate final stats
        const correctCount = newResults.filter(r => r.isCorrect).length;
        const incorrectCount = newResults.length - correctCount;
        const accuracy = Math.round((correctCount / newResults.length) * 100);
        
        // Save final results with complete stats
        const finalResults = {
          correctCount,
          incorrectCount,
          accuracy,
          timeSpent: "Session Complete",
          mostDifficultSubject: data.flashcards[0].subject,
          flashcards: data.flashcards.map((card: Flashcard) => ({
            ...card,
            isCorrect: newResults.find(r => r.flashcardId === card.id)?.isCorrect || false
          })),
          stats: {
            correct: correctCount,
            incorrect: incorrectCount,
            percentage: accuracy
          },
          round,
          totalRounds
        };
        
        // Store final results
        sessionStorage.setItem(`results-${sessionId}`, JSON.stringify(finalResults));
        setLocation(`/results/${sessionId}`);
      } else {
        // Start next round
        setRound(round + 1);
        setCurrentIndex(0);
        setResults([]);
        setIsFlipped(false);
        
        // Update session storage with new round
        const sessionData = {
          ...data,
          round: round + 1
        };
        sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(sessionData));
        
        toast({
          title: `Round ${round} Complete!`,
          description: `Starting round ${round + 1} of ${totalRounds}`,
        });
      }
    } else {
      // Move to next card
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
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

  // Function to handle quitting the session
  const handleQuitSession = () => {
    setShowExitConfirmation(true);
  };

  // Function to confirm quitting the session
  const confirmQuitSession = () => {
    // Calculate skipped questions
    const skippedCount = data.flashcards.length - results.length;
    const finalResults = {
      ...stats,
      skipped: skippedCount,
      flashcards: data.flashcards.map((card: Flashcard) => ({
        ...card,
        isCorrect: results.find(r => r.flashcardId === card.id)?.isCorrect || false
      }))
    };
    sessionStorage.setItem(`results-${sessionId}`, JSON.stringify(finalResults));
    setLocation(`/results/${sessionId}`);
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-brain text-primary text-2xl"></i>
            <h1 className="text-xl font-bold">FlashLearn</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-1 border-red-400 text-red-500"
            onClick={handleQuitSession}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Quit Session</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-start">
        <div className="max-w-4xl w-full">
          {/* Stats and Progress Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-green-100 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <div className="text-sm text-green-700">Correct</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-red-100 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                <div className="text-sm text-red-700">Incorrect</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-blue-100 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                <div className="text-sm text-blue-700">Accuracy</div>
              </motion.div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Progress: <span className="font-bold text-foreground">{currentIndex + 1}</span>/<span>{data?.flashcards?.length}</span>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Round: <span className="font-bold text-foreground">{round}</span>/<span>{totalRounds}</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((currentIndex + 1) / (data?.flashcards?.length || 1)) * 100}%` 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Flashcard */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {data?.flashcards[currentIndex] && (
                <FlashcardContainer
                  flashcard={data.flashcards[currentIndex]}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(!isFlipped)}
                  onKnow={() => handleResponse(true)}
                  onDontKnow={() => handleResponse(false)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Card Navigation */}
          <motion.div 
            className="flex justify-between mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              className={`text-gray-500 hover:text-gray-700 flex items-center space-x-1 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm">Previous</span>
            </button>
            <button 
              className={`text-gray-500 hover:text-gray-700 flex items-center space-x-1 ${currentIndex === (data?.flashcards?.length || 0) - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNext}
              disabled={currentIndex === (data?.flashcards?.length || 0) - 1}
            >
              <span className="text-sm">Next</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </motion.div>
        </div>
      </main>

      {/* Render confirmation dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Exit</h2>
            <p className="mb-4">Are you sure you want to quit the session? Your progress will be saved.</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowExitConfirmation(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmQuitSession}>Yes, Quit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
