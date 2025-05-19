import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

interface Question {
  question: string;
  answer: string;
}

export async function generatePdfQuestions(pdfId: string, count: number, difficulty: string = 'medium'): Promise<Question[]> {
  try {
    // Get the PDF name from localStorage
    const pdfName = localStorage.getItem(pdfId);
    if (!pdfName) {
      throw new Error('PDF not found');
    }

    // Clean up the PDF name to get a better topic
    const topic = pdfName.replace('.pdf', '').replace(/[_-]/g, ' ');

    // Try OpenAI
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      try {
        const prompt = `Generate ${count} ${difficulty} level questions based on the topic: "${topic}".
If this is a hard difficulty level, include complex analytical questions and advanced concepts.
If this is a medium difficulty, balance conceptual understanding with application.
If this is an easy difficulty, focus on fundamental concepts and basic understanding.

The questions should match the difficulty level exactly - no easier questions for hard difficulty.
For hard difficulty, include questions that:
- Require deep analysis
- Combine multiple concepts
- Test advanced applications
- Challenge critical thinking
- Require problem-solving skills

Return the questions in this JSON format:
{
  "questions": [
    {
      "question": "What is the relationship between X and Y in the context of ${topic}?",
      "answer": "A detailed explanation of the relationship..."
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert in creating ${difficulty} difficulty educational questions about ${topic}. Focus on generating challenging questions that match the exact difficulty level requested.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response from OpenAI');
        }

        const parsedResponse = JSON.parse(content) as { questions: Question[] };
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
          throw new Error('Invalid response format from OpenAI');
        }

        return parsedResponse.questions;
      } catch (error) {
        console.error('OpenAI error:', error);
        // Fall through to mock questions
      }
    }

    // If API fails or no API key, return mock questions
    return getMockQuestions(topic, count, difficulty);
  } catch (error) {
    console.error('Error generating PDF questions:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
    throw new Error('Failed to generate questions from PDF. Please try again.');
  }
}

// Mock questions as final fallback
function getMockQuestions(topic: string, count: number, difficulty: string): Question[] {
  const mockQuestions = {
    hard: [
      {
        question: `What are the advanced theoretical implications of ${topic} in real-world applications?`,
        answer: "This would require analysis of complex interactions and advanced concepts..."
      },
      {
        question: `How do multiple aspects of ${topic} integrate in complex scenarios?`,
        answer: "The integration involves several key advanced principles..."
      },
      {
        question: `Analyze the relationship between ${topic} and related advanced concepts.`,
        answer: "The relationship involves complex interactions between multiple systems..."
      }
    ],
    medium: [
      {
        question: `How is ${topic} applied in practical situations?`,
        answer: "The practical applications include several key aspects..."
      },
      {
        question: `What are the main components of ${topic} and how do they interact?`,
        answer: "The main components and their interactions include..."
      },
      {
        question: `Explain the process of ${topic} with examples.`,
        answer: "The process involves several steps and examples..."
      }
    ],
    easy: [
      {
        question: `What is the basic definition of ${topic}?`,
        answer: "The basic definition and key concepts include..."
      },
      {
        question: `List the main characteristics of ${topic}.`,
        answer: "The main characteristics include..."
      },
      {
        question: `What is the primary purpose of ${topic}?`,
        answer: "The primary purpose is to..."
      }
    ]
  };

  // Select questions based on difficulty
  const difficultyQuestions = mockQuestions[difficulty as keyof typeof mockQuestions] || mockQuestions.medium;
  return difficultyQuestions.slice(0, count);
}

async function getPdfContent(pdfId: string): Promise<string> {
  // For now, return mock content based on the PDF ID
  // In a real application, you would fetch this from your storage
  return `This is a sample text about ${pdfId}.
It contains important information about various topics.
The main concepts include learning, memory, and cognitive development.
Students should understand these fundamental principles.`;
} 