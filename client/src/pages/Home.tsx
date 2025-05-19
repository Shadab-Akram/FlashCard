import { useState } from "react";
import { useLocation } from "wouter";
import StudySettings from "@/components/StudySettings";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMediaQuery } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-brain text-primary text-2xl"></i>
            <h1 className="text-xl font-bold">FlashLearn</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row relative">
        {/* Settings Panel - Hidden by default on mobile */}
        <div 
          className={`
            bg-card shadow-md md:shadow-none w-full md:w-80 p-4 md:p-6 md:h-[calc(100vh-64px)] 
            md:overflow-y-auto transition-all duration-300 transform md:transform-none
            ${isMobile && !settingsPanelVisible ? 'hidden' : 'block'}
          `}
        >
          <StudySettings 
            onClose={() => setSettingsPanelVisible(false)}
          />
        </div>

        {/* Content Area */}
        <div className="flex-grow p-4 md:p-8 flex flex-col items-center justify-start md:overflow-y-auto">
          <div className="max-w-2xl w-full">
            <div className="text-center space-y-6 py-8">
              <img 
                src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                alt="Student studying with flashcards" 
                className="rounded-xl shadow-lg mx-auto w-full max-w-md"
              />
              
              <h2 className="text-2xl font-bold">Welcome to FlashLearn</h2>
              
              <p className="text-muted-foreground max-w-md mx-auto">
                Improve your knowledge with AI-powered flashcards. Choose a subject or upload your own content to begin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-primary text-xl mb-2">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <h3 className="font-medium">Smart Questions</h3>
                    <p className="text-sm text-muted-foreground">AI-generated questions across difficulty levels</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-primary text-xl mb-2">
                      <i className="fas fa-sync-alt"></i>
                    </div>
                    <h3 className="font-medium">Spaced Repetition</h3>
                    <p className="text-sm text-muted-foreground">Learn efficiently with proven memory techniques</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-primary text-xl mb-2">
                      <i className="fas fa-file-upload"></i>
                    </div>
                    <h3 className="font-medium">Custom Content</h3>
                    <p className="text-sm text-muted-foreground">Upload your PDF to create personalized cards</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <AnimatePresence>
          {isMobile && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettingsPanelVisible(!settingsPanelVisible)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
            >
              <i className={`fas fa-${settingsPanelVisible ? 'times' : 'cog'} text-xl`}></i>
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
