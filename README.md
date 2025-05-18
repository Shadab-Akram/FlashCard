# FlashLearn - Interactive Flashcard Viewer

An interactive Flashcard Viewer Web App with AI-generated questions, PDF uploads, and progressive difficulty rounds.

## Features

- AI-generated flashcards based on subject, class level and difficulty
- PDF uploads for creating custom flashcards
- Dark/light mode theme support
- Interactive card flipping animations
- Multiple rounds with progress tracking
- Session statistics and results

## Running Locally

To run this project locally on your machine, follow these steps:

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository to your local machine:
```bash
git clone https://github.com/yourusername/flashlearn.git
cd flashlearn
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and schemas

## OpenAI API Key

This project uses the OpenAI API to generate flashcards. You need to provide your own API key in the `.env` file as shown above.

If you don't have an API key, you can use the application with mock data that demonstrates the functionality.

## Technologies Used

- React for frontend
- Express for backend
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- Tanstack Query for data fetching
- Wouter for routing

## License

MIT