import { FlashcardResponse } from "@shared/schema";

// Interface for study session parameters
interface StudySessionParams {
  subject: string;
  classLevel: string;
  difficulty: string;
  count: number;
}

// Function to generate flashcard content
export async function generateFlashcards(params: StudySessionParams): Promise<FlashcardResponse[]> {
  try {
    const response = await fetch('/api/study-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate flashcards');
    }

    const data = await response.json();
    return data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}

// Function to generate flashcards from PDF content
export async function generateFlashcardsFromPdf(params: StudySessionParams & { pdfId: string }): Promise<FlashcardResponse[]> {
  try {
    const response = await fetch('/api/study-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate flashcards from PDF');
    }

    const data = await response.json();
    return data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards from PDF:', error);
    throw error;
  }
}
