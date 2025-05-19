export interface FlashcardResponse {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  classLevel?: string;
} 