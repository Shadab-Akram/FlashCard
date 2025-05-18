import {
  Flashcard,
  FlashcardResponse,
  FlashcardRoundResult,
  PdfDocument,
  insertFlashcardSchema,
  subjects,
  classLevels,
  difficultyLevels,
  questionCounts,
} from "@shared/schema";
import { type User, type InsertUser } from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flashcard methods
  saveGeneratedFlashcards(
    flashcards: Omit<Flashcard, "id" | "source" | "sourceId">[],
    source: string,
    sourceId?: string
  ): Promise<Flashcard[]>;
  getFlashcardsByIds(ids: number[]): Promise<Flashcard[]>;
  
  // Session methods
  saveRoundResults(
    sessionId: string,
    round: number,
    results: FlashcardRoundResult[]
  ): Promise<void>;
  getSessionStats(sessionId: string): Promise<any>;
  
  // PDF methods
  savePdfDocument(document: PdfDocument): Promise<void>;
  getPdfDocument(id: string): Promise<PdfDocument | undefined>;
  
  // Options methods
  getOptions(): Promise<{
    subjects: typeof subjects;
    classLevels: typeof classLevels;
    difficultyLevels: typeof difficultyLevels;
    questionCounts: typeof questionCounts;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flashcards: Map<number, Flashcard>;
  private pdfDocuments: Map<string, PdfDocument>;
  private sessionResults: Map<string, { 
    rounds: Map<number, FlashcardRoundResult[]>,
    startTime: Date
  }>;
  private currentUserId: number;
  private currentFlashcardId: number;

  constructor() {
    this.users = new Map();
    this.flashcards = new Map();
    this.pdfDocuments = new Map();
    this.sessionResults = new Map();
    this.currentUserId = 1;
    this.currentFlashcardId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Flashcard methods
  async saveGeneratedFlashcards(
    flashcards: Omit<Flashcard, "id" | "source" | "sourceId">[],
    source: string,
    sourceId?: string
  ): Promise<Flashcard[]> {
    const savedFlashcards: Flashcard[] = [];

    for (const card of flashcards) {
      const id = this.currentFlashcardId++;
      const flashcard: Flashcard = {
        id,
        ...card,
        source,
        sourceId: sourceId || null,
      };
      this.flashcards.set(id, flashcard);
      savedFlashcards.push(flashcard);
    }

    return savedFlashcards;
  }

  async getFlashcardsByIds(ids: number[]): Promise<Flashcard[]> {
    return ids
      .map((id) => this.flashcards.get(id))
      .filter((card): card is Flashcard => card !== undefined);
  }

  // Session methods
  async saveRoundResults(
    sessionId: string,
    round: number,
    results: FlashcardRoundResult[]
  ): Promise<void> {
    let session = this.sessionResults.get(sessionId);

    if (!session) {
      session = {
        rounds: new Map(),
        startTime: new Date(),
      };
      this.sessionResults.set(sessionId, session);
    }

    session.rounds.set(round, results);
  }

  async getSessionStats(sessionId: string): Promise<any> {
    const session = this.sessionResults.get(sessionId);

    if (!session) {
      return null;
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor((durationMs % 60000) / 1000);

    let totalCards = 0;
    let correctCount = 0;
    const roundResults: any[] = [];
    const flashcardStats: Map<number, { correct: boolean, flashcard?: Flashcard }> = new Map();

    // Process results for each round
    session.rounds.forEach((results, roundNum) => {
      totalCards += results.length;
      const roundCorrect = results.filter((r: FlashcardRoundResult) => r.isCorrect).length;
      correctCount += roundCorrect;

      // Store stats for each flashcard
      for (const result of results) {
        const flashcard = this.flashcards.get(result.flashcardId);
        flashcardStats.set(result.flashcardId, { 
          correct: result.isCorrect,
          flashcard
        });
      }

      roundResults.push({
        round: roundNum,
        total: results.length,
        correct: roundCorrect,
        accuracy: results.length > 0 ? (roundCorrect / results.length) * 100 : 0,
      });
    });

    // Find difficult topics
    const incorrectCards = Array.from(flashcardStats.values())
      .filter((stat) => !stat.correct && stat.flashcard)
      .map((stat) => stat.flashcard as Flashcard);

    const subjectCounts: Record<string, number> = {};
    
    for (const card of incorrectCards) {
      subjectCounts[card.subject] = (subjectCounts[card.subject] || 0) + 1;
    }

    const mostDifficultSubject = Object.entries(subjectCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([subject]) => subject)[0] || 'None identified';

    return {
      totalCards,
      correctCount,
      incorrectCount: totalCards - correctCount,
      accuracy: totalCards > 0 ? (correctCount / totalCards) * 100 : 0,
      timeSpent: `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`,
      roundResults,
      mostDifficultSubject,
    };
  }

  // PDF methods
  async savePdfDocument(document: PdfDocument): Promise<void> {
    this.pdfDocuments.set(document.id, document);
  }

  async getPdfDocument(id: string): Promise<PdfDocument | undefined> {
    return this.pdfDocuments.get(id);
  }

  // Options methods
  async getOptions() {
    return {
      subjects,
      classLevels,
      difficultyLevels,
      questionCounts,
    };
  }
}

export const storage = new MemStorage();
