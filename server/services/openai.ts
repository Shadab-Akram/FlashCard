import OpenAI from "openai";
import { Flashcard } from "@shared/schema";
import { z } from "zod";

// Configure OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "YOUR_API_KEY" 
});

// Schema for AI response validation
const aiFlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const aiFlashcardsResponseSchema = z.array(aiFlashcardSchema);

interface GenerateQuestionsOptions {
  subject: string;
  classLevel: string;
  difficulty: string;
  count: number;
  pdfContent?: string;
}

export async function generateAIQuestions(options: GenerateQuestionsOptions): Promise<Omit<Flashcard, "id" | "source" | "sourceId">[]> {
  try {
    // Build the prompt based on options
    let prompt = `Generate ${options.count} flashcards for ${options.subject} at ${options.classLevel} level with ${options.difficulty} difficulty.`;
    
    // Add context from PDF if available
    if (options.pdfContent) {
      prompt += ` Base the questions on the following content: "${options.pdfContent.substring(0, 3000)}..."`;
    }
    
    prompt += `\n\nFormat the response as a JSON array with "question" and "answer" fields for each flashcard. Ensure that the questions are appropriate for the ${options.difficulty} difficulty level and ${options.classLevel} grade level. For example:
    [
      {
        "question": "Clear, concise question text?",
        "answer": "Comprehensive answer that provides complete information."
      }
    ]`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert educational content creator who specializes in making effective flashcards for students. Create flashcards that are clear, educational, and appropriate for the specified grade level and difficulty.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in the response");
    }

    const parsedContent = JSON.parse(content);
    
    // Make sure the response contains an array of flashcards
    if (!Array.isArray(parsedContent)) {
      if (Array.isArray(parsedContent.flashcards)) {
        const validatedFlashcards = aiFlashcardsResponseSchema.parse(parsedContent.flashcards);
        return validatedFlashcards.map(card => ({
          ...card,
          subject: options.subject,
          classLevel: options.classLevel,
          difficulty: options.difficulty,
        }));
      }
      throw new Error("Response is not in the expected format");
    }
    
    // Validate and map the flashcards
    const validatedFlashcards = aiFlashcardsResponseSchema.parse(parsedContent);
    
    return validatedFlashcards.map(card => ({
      ...card,
      subject: options.subject,
      classLevel: options.classLevel,
      difficulty: options.difficulty,
    }));

  } catch (error) {
    console.error("Error generating AI questions:", error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
