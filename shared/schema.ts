import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication (base implementation)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Flashcard related schemas
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  subject: text("subject").notNull(),
  classLevel: text("class_level").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  source: text("source").notNull().default("default"), // default, pdf, custom
  sourceId: text("source_id"), // id of pdf document if from pdf
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

export const flashcardResponseSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  subject: z.string(),
  classLevel: z.string(),
  difficulty: z.string(),
  isCorrect: z.boolean().optional(),
});

export const generateQuestionsSchema = z.object({
  subject: z.string(),
  classLevel: z.string(),
  difficulty: z.string(),
  count: z.number().min(1).max(15),
});

export const studySessionSchema = z.object({
  subject: z.string(),
  classLevel: z.string(),
  difficulty: z.string(),
  count: z.number().min(1).max(15),
  rounds: z.number().min(1).max(5),
  pdfId: z.string().optional(),
});

export const flashcardRoundResultSchema = z.object({
  flashcardId: z.number(),
  isCorrect: z.boolean(),
});

export const pdfDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type FlashcardResponse = z.infer<typeof flashcardResponseSchema>;

export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsSchema>;
export type StudySessionRequest = z.infer<typeof studySessionSchema>;
export type FlashcardRoundResult = z.infer<typeof flashcardRoundResultSchema>;
export type PdfDocument = z.infer<typeof pdfDocumentSchema>;

// Subjects and class levels for dropdown options
export const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "literature", label: "Literature" },
  { value: "computer_science", label: "Computer Science" }
];

export const classLevels = [
  { value: "1", label: "1st Class" },
  { value: "5", label: "5th Class" },
  { value: "9", label: "9th Class" },
  { value: "12", label: "12th Class" },
  { value: "college", label: "College Level" }
];

export const difficultyLevels = [
  { value: "easy", label: "Easy", color: "success", icon: "battery-quarter" },
  { value: "medium", label: "Medium", color: "warning", icon: "battery-half" },
  { value: "hard", label: "Hard", color: "error", icon: "battery-full" }
];

export const questionCounts = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" }
];
