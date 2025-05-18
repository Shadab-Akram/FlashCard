import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { generateAIQuestions } from "./services/openai";
import { parsePdfContent } from "./services/pdfParser";
import {
  studySessionSchema,
  flashcardRoundResultSchema,
  pdfDocumentSchema,
  Flashcard,
  FlashcardResponse,
} from "@shared/schema";
import { ZodError } from "zod";
import path from "path";
import fs from "fs";

// Set up multer storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDFs
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get available subjects, class levels, etc. for dropdowns
  app.get("/api/options", async (req, res) => {
    try {
      const options = await storage.getOptions();
      res.json(options);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve options" });
    }
  });

  // Upload a PDF document
  app.post(
    "/api/upload-pdf",
    upload.single("pdf"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const documentId = uuidv4();
        const pdfBuffer = req.file.buffer;
        const pdfContent = await parsePdfContent(pdfBuffer);

        const pdfDocument = {
          id: documentId,
          name: req.file.originalname,
          content: pdfContent,
        };

        await storage.savePdfDocument(pdfDocument);

        res.json({
          id: documentId,
          name: req.file.originalname,
          message: "PDF uploaded successfully",
        });
      } catch (error) {
        console.error("PDF upload error:", error);
        res.status(500).json({
          message: "Failed to upload PDF",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Start a new study session
  app.post("/api/study-session", async (req, res) => {
    try {
      const sessionData = studySessionSchema.parse(req.body);
      
      let flashcards: Flashcard[] = [];
      
      // If a PDF is provided, generate questions from it
      if (sessionData.pdfId) {
        const pdfDocument = await storage.getPdfDocument(sessionData.pdfId);
        if (!pdfDocument) {
          return res.status(404).json({ message: "PDF document not found" });
        }
        
        // Generate questions from the PDF content
        const generatedQuestions = await generateAIQuestions({
          subject: sessionData.subject,
          classLevel: sessionData.classLevel,
          difficulty: sessionData.difficulty,
          count: sessionData.count,
          pdfContent: pdfDocument.content,
        });
        
        // Save generated questions
        flashcards = await storage.saveGeneratedFlashcards(generatedQuestions, "pdf", sessionData.pdfId);
      } else {
        // Generate questions based on the topic
        const generatedQuestions = await generateAIQuestions({
          subject: sessionData.subject,
          classLevel: sessionData.classLevel,
          difficulty: sessionData.difficulty,
          count: sessionData.count,
        });
        
        // Save generated questions
        flashcards = await storage.saveGeneratedFlashcards(generatedQuestions, "default");
      }
      
      // Return the flashcards for the first round
      res.json({
        sessionId: uuidv4(), // Generate a unique session ID
        flashcards: flashcards.map((card) => ({
          id: card.id,
          question: card.question,
          answer: card.answer,
          subject: card.subject,
          classLevel: card.classLevel,
          difficulty: card.difficulty,
        })),
        round: 1,
        totalRounds: sessionData.rounds,
      });
    } catch (error) {
      console.error("Study session error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          message: "Failed to create study session",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });

  // Submit round results and get next round if available
  app.post("/api/round-results", async (req, res) => {
    try {
      const { sessionId, results, round, totalRounds } = req.body;
      
      if (!sessionId || !results || !Array.isArray(results)) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Validate each result
      const validatedResults = results.map((result) => 
        flashcardRoundResultSchema.parse(result)
      );
      
      // Store the results
      await storage.saveRoundResults(sessionId, round, validatedResults);
      
      // Check if there are more rounds
      if (round < totalRounds) {
        // Get the flashcards for incorrect answers to include in the next round
        const incorrectCardIds = validatedResults
          .filter((result) => !result.isCorrect)
          .map((result) => result.flashcardId);
        
        // Get the flashcards for the next round
        const incorrectCards = await storage.getFlashcardsByIds(incorrectCardIds);
        
        // Adjust difficulty for the next round
        const nextRoundCards: FlashcardResponse[] = incorrectCards.map((card) => {
          let nextDifficulty = card.difficulty;
          
          // Increase difficulty for the next round
          if (card.difficulty === "easy") {
            nextDifficulty = "medium";
          } else if (card.difficulty === "medium") {
            nextDifficulty = "hard";
          }
          
          return {
            id: card.id,
            question: card.question,
            answer: card.answer,
            subject: card.subject,
            classLevel: card.classLevel,
            difficulty: nextDifficulty,
          };
        });
        
        res.json({
          sessionId,
          flashcards: nextRoundCards,
          round: round + 1,
          totalRounds,
        });
      } else {
        // Final round completed
        const sessionStats = await storage.getSessionStats(sessionId);
        res.json({
          sessionId,
          completed: true,
          stats: sessionStats,
        });
      }
    } catch (error) {
      console.error("Round results error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          message: "Failed to process round results",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });

  // Get session statistics
  app.get("/api/session-stats/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stats = await storage.getSessionStats(sessionId);
      
      if (!stats) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Session stats error:", error);
      res.status(500).json({
        message: "Failed to get session statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
