import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

interface ResultStats {
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number;
  timeSpent?: string;
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
    isCorrect?: boolean;
    subject: string;
    difficulty: string;
  }>;
  round?: number;
  totalRounds?: number;
}

export default function Results() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/session-stats/${sessionId}`],
    queryFn: async () => {
      if (!sessionId) return null;
      
      // Get both results and original session data
      const storedResults = sessionStorage.getItem(`results-${sessionId}`);
      const originalSession = sessionStorage.getItem(`flashcards-${sessionId}`);
      
      if (storedResults && originalSession) {
        const parsedResults = JSON.parse(storedResults);
        const sessionData = JSON.parse(originalSession);
        
        const flashcardsWithStatus = parsedResults.flashcards.map((card: any) => ({
          ...card,
          status: parsedResults.results?.find((r: any) => r.flashcardId === card.id)
            ? (parsedResults.results.find((r: any) => r.flashcardId === card.id).isCorrect ? 'correct' : 'incorrect')
            : 'skipped'
        }));

        return {
          ...parsedResults,
          correct: flashcardsWithStatus.filter((c: any) => c.status === 'correct').length,
          incorrect: flashcardsWithStatus.filter((c: any) => c.status === 'incorrect').length,
          skipped: flashcardsWithStatus.filter((c: any) => c.status === 'skipped').length,
          percentage: Math.round((flashcardsWithStatus.filter((c: any) => c.status === 'correct').length / 
            flashcardsWithStatus.filter((c: any) => c.status !== 'skipped').length) * 100) || 0,
          timeSpent: parsedResults.timeSpent || "Session Incomplete",
          round: sessionData.round || 1,
          totalRounds: sessionData.totalRounds || 1,
          flashcards: flashcardsWithStatus
        };
      }
      
      throw new Error("No results found for this session");
    }
  });

  const handleNextQuestion = () => {
    if (data?.flashcards && currentQuestionIndex < data.flashcards.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
          <i className="fas fa-exclamation-circle text-4xl text-destructive mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Error Loading Results</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error 
              ? error.message 
              : "Failed to load session results. Please try again."}
          </p>
          <Button onClick={() => setLocation("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-brain text-primary text-2xl"></i>
            <h1 className="text-xl font-bold">FlashLearn</h1>
          </div>
            <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl font-bold">
              {data.round >= data.totalRounds ? "Study Session Complete!" : "Session Progress"}
            </h2>
            
            <Card className="bg-card shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Session Overview</h3>
                  <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                    Round {data.round} of {data.totalRounds}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">{data.correct}</div>
                    <div className="text-sm text-green-700 dark:text-green-200">Correct</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-red-600 dark:text-red-300">{data.incorrect}</div>
                    <div className="text-sm text-red-700 dark:text-red-200">Incorrect</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {data.percentage}%
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-200">Accuracy</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{data.skipped}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-200">Skipped</div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Subject</div>
                    <div className="font-semibold mt-1 capitalize">{data.flashcards[0]?.subject || 'N/A'}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                    <div className="font-semibold mt-1 capitalize">{data.flashcards[0]?.difficulty || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg mb-4">Question Review</h4>
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Question {currentQuestionIndex + 1}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        data.flashcards[currentQuestionIndex].status === 'correct'
                          ? 'bg-green-100 text-green-700'
                          : data.flashcards[currentQuestionIndex].status === 'incorrect'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {data.flashcards[currentQuestionIndex].status === 'correct'
                          ? 'Correct'
                          : data.flashcards[currentQuestionIndex].status === 'incorrect'
                          ? 'Incorrect'
                          : 'Skipped'}
                      </span>
                    </div>
                    <p className="text-foreground mb-2">{data.flashcards[currentQuestionIndex].question}</p>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Answer:</div>
                      <p className="text-foreground">{data.flashcards[currentQuestionIndex].answer}</p>
                    </div>
                  </motion.div>

                  <div className="flex justify-between items-center mt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="transition-colors hover:bg-primary/10"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Previous
                      </Button>
                    </motion.div>

                    <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                      {currentQuestionIndex + 1} of {data.flashcards.length}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === data.flashcards.length - 1}
                        className="transition-colors hover:bg-primary/10"
                      >
                        Next
                        <i className="fas fa-arrow-right ml-2"></i>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
              <Button 
                variant="outline" 
                  className="flex-1 max-w-xs w-full"
                onClick={() => setLocation("/")}
              >
                  <i className="fas fa-home mr-2"></i>
                Start New Session
              </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default"
                  className="flex-1 max-w-xs w-full"
                  onClick={() => {
                    // Get the original session data
                    const lastSession = JSON.parse(sessionStorage.getItem(`flashcards-${sessionId}`) || '{}');
                    if (lastSession.flashcards?.[0]) {
                      // Create a new session with the same settings
                      const newSession = {
                        flashcards: lastSession.flashcards,
                        round: 1,
                        totalRounds: lastSession.totalRounds,
                        subject: lastSession.flashcards[0].subject,
                        difficulty: lastSession.flashcards[0].difficulty
                      };
                      
                      // Generate a new session ID
                      const newSessionId = `session-${Date.now()}`;
                      
                      // Store the new session
                      sessionStorage.setItem(`flashcards-${newSessionId}`, JSON.stringify(newSession));
                      
                      // Navigate to the new session
                      setLocation(`/flashcards/${newSessionId}`);
                    } else {
                      setLocation('/');
                    }
                  }}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Retry Same Topic
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
