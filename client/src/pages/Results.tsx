import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import StatCard from "@/components/StatCard";

export default function Results() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/session-stats/${sessionId}`],
    queryFn: async () => {
      if (!sessionId) return null;
      
      // First, check if we have stored results for this session
      const storedResults = sessionStorage.getItem(`results-${sessionId}`);
      if (storedResults) {
        return JSON.parse(storedResults);
      }
      
      // Check if this is a mock session ID (from when OpenAI API was unavailable)
      const isMockSession = sessionId?.startsWith('mock-session-');
      
      if (isMockSession) {
        // For mock sessions without stored results, create sample data
        return {
          correctCount: 12,
          incorrectCount: 3,
          accuracy: 80,
          timeSpent: "5 minutes",
          mostDifficultSubject: "Science",
          flashcards: [
            { id: 1, question: "What is the capital of France?", answer: "Paris", isCorrect: true },
            { id: 2, question: "Who wrote Hamlet?", answer: "William Shakespeare", isCorrect: true },
            { id: 3, question: "What is the chemical symbol for water?", answer: "H₂O", isCorrect: false }
          ]
        };
      }
      
      // For real sessions, fetch from API
      try {
        const response = await fetch(`/api/session-stats/${sessionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch session stats");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching session stats:", error);
        throw new Error("Failed to fetch session data");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-400 mb-4"></i>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <i className="fas fa-exclamation-circle text-4xl text-error mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-brain text-primary text-2xl"></i>
            <h1 className="text-xl font-bold">FlashLearn</h1>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-start">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800">Study Session Complete!</h2>
            
            {/* Abstract knowledge concept visualization */}
            <img 
              src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
              alt="Knowledge visualization abstract" 
              className="rounded-xl shadow-lg mx-auto"
            />
            
            <Card className="bg-white shadow-lg p-6 max-w-md mx-auto">
              <CardContent className="p-0">
                <h3 className="font-bold text-lg mb-4">Session Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <StatCard 
                    value={data.correctCount} 
                    label="Correct" 
                    color="success"
                  />
                  <StatCard 
                    value={data.incorrectCount} 
                    label="Incorrect" 
                    color="error"
                  />
                  <StatCard 
                    value={`${Math.round(data.accuracy)}%`} 
                    label="Accuracy" 
                    color="gray"
                  />
                  <StatCard 
                    value={data.timeSpent} 
                    label="Time Spent" 
                    color="gray"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Most difficult questions were from:</p>
                  <div className="text-left p-3 bg-error bg-opacity-10 rounded-lg border border-error border-opacity-20">
                    <span className="font-medium text-gray-800">{data.mostDifficultSubject}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
              <Button 
                variant="outline" 
                className="flex-1 border border-primary-400 text-primary-400"
                onClick={() => setLocation("/")}
              >
                Start New Session
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
