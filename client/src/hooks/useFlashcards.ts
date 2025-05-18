import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FlashcardResponse } from "@shared/schema";

interface UseFlashcardsProps {
  sessionId: string;
}

interface FlashcardState {
  flashcards: FlashcardResponse[];
  currentIndex: number;
  isFlipped: boolean;
  round: number;
  totalRounds: number;
  results: Array<{ flashcardId: number; isCorrect: boolean }>;
  stats: {
    correct: number;
    incorrect: number;
    percentage: number;
  };
}

export function useFlashcards({ sessionId }: UseFlashcardsProps) {
  const { toast } = useToast();
  
  // State
  const [state, setState] = useState<FlashcardState>({
    flashcards: [],
    currentIndex: 0,
    isFlipped: false,
    round: 1,
    totalRounds: 1,
    results: [],
    stats: {
      correct: 0,
      incorrect: 0,
      percentage: 0,
    },
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

  // Submit round results and get next round
  const submitRoundMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      results: typeof state.results;
      round: number;
      totalRounds: number;
    }) => {
      const response = await apiRequest("POST", "/api/round-results", data);
      return await response.json();
    },
    onSuccess: (data) => {
      // If session completed, return completed status
      if (data.completed) {
        setState((prev) => ({
          ...prev,
          completed: true,
        }));
        return;
      }
      
      // Otherwise, update state for the next round
      setState((prev) => ({
        ...prev,
        flashcards: data.flashcards,
        currentIndex: 0,
        isFlipped: false,
        round: data.round,
        results: [],
      }));
      
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

  // Update state when data is loaded
  useEffect(() => {
    if (data) {
      setState((prev) => ({
        ...prev,
        flashcards: data.flashcards || [],
        round: data.round || 1,
        totalRounds: data.totalRounds || 1,
      }));
      
      // Save data to sessionStorage
      sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(data));
    }
  }, [data, sessionId]);

  // Update stats when results change
  useEffect(() => {
    if (state.results.length > 0) {
      const correctCount = state.results.filter((r) => r.isCorrect).length;
      const incorrectCount = state.results.length - correctCount;
      const percentage = Math.round((correctCount / state.results.length) * 100);
      
      setState((prev) => ({
        ...prev,
        stats: {
          correct: correctCount,
          incorrect: incorrectCount,
          percentage,
        },
      }));
    }
  }, [state.results]);

  // Handle flipping the card
  const flipCard = () => {
    setState((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  };

  // Handle user responses (Know/Don't Know)
  const handleResponse = (isCorrect: boolean) => {
    if (!state.flashcards || state.currentIndex >= state.flashcards.length) return;
    
    // Add result
    const flashcardId = state.flashcards[state.currentIndex].id;
    const newResults = [...state.results, { flashcardId, isCorrect }];
    
    setState((prev) => ({
      ...prev,
      results: newResults,
    }));
    
    // Move to next card
    if (state.currentIndex < state.flashcards.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
      }));
    } else {
      // Submit round results when all cards have been answered
      submitRoundMutation.mutate({
        sessionId,
        results: newResults,
        round: state.round,
        totalRounds: state.totalRounds,
      });
    }
  };

  // Handle navigation between cards
  const goToPrevious = () => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        isFlipped: false,
      }));
    }
  };

  const goToNext = () => {
    if (state.flashcards && state.currentIndex < state.flashcards.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
      }));
    }
  };

  return {
    ...state,
    isLoading,
    error,
    flipCard,
    handleResponse,
    goToPrevious,
    goToNext,
    submitRoundMutation,
  };
}
