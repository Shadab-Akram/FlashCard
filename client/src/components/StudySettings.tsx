import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generateQuestions, generatePdfQuestions } from "@/lib/static-questions";
import { PdfUploader } from "@/components/PdfUploader";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subjects, classLevels, difficultyLevels, questionCounts } from "@/lib/schema";

// Define our form schemas based on the mode (topic or PDF)
const topicSettingsSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject" }),
  classLevel: z.string().min(1, { message: "Please select a class level" }),
  difficulty: z.string().min(1, { message: "Please select a difficulty level" }),
  count: z.number().min(5).max(15),
  rounds: z.number().min(1).max(5),
});

const pdfSettingsSchema = z.object({
  // For PDF mode, we only need difficulty and rounds
  difficulty: z.string().min(1, { message: "Please select a difficulty level" }),
  rounds: z.number().min(1).max(5),
  count: z.number().min(5).max(15).default(10),
  // We'll include these with default values for the API
  subject: z.string().default("general"),
  classLevel: z.string().default("college"),
  pdfId: z.string().min(1, { message: "Please upload a PDF document" }),
});

type TopicSettingsFormValues = z.infer<typeof topicSettingsSchema>;
type PdfSettingsFormValues = z.infer<typeof pdfSettingsSchema>;

interface StudySettingsProps {
  onClose?: () => void;
}

export default function StudySettings({ onClose }: StudySettingsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("topic");
  const [uploadedPdfId, setUploadedPdfId] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

  // Form for topic-based questions
  const topicForm = useForm<TopicSettingsFormValues>({
    resolver: zodResolver(topicSettingsSchema),
    defaultValues: {
      subject: "",
      classLevel: "",
      difficulty: "medium",
      count: 10,
      rounds: 3,
    },
  });

  // Form for PDF-based questions
  const pdfForm = useForm<PdfSettingsFormValues>({
    resolver: zodResolver(pdfSettingsSchema),
    defaultValues: {
      difficulty: "medium",
      count: 10,
      rounds: 3,
      subject: "general",
      classLevel: "college",
    },
  });

  // Update the PDF ID in the form when a PDF is uploaded
  useEffect(() => {
    if (uploadedPdfId) {
      pdfForm.setValue("pdfId", uploadedPdfId);
    }
  }, [uploadedPdfId, pdfForm]);

  const startStudyMutation = useMutation({
    mutationFn: async (data: TopicSettingsFormValues | (PdfSettingsFormValues & { pdfId: string })) => {
      // Display a toast when we're starting
      toast({
        title: "Creating Study Session",
        description: "Preparing your flashcards...",
      });

      let questions;
      try {
        if ('pdfId' in data && data.pdfId) {
          // Handle PDF questions
          questions = generatePdfQuestions(data.pdfId, data.count, data.difficulty);
        } else {
          // Generate static questions for regular subjects
          questions = generateQuestions({
            subject: data.subject,
            classLevel: data.classLevel,
            difficulty: data.difficulty,
            count: data.count
          });
        }

        // Create flashcards with the generated questions
        const flashcards = questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          answer: q.answer,
          subject: data.subject,
          classLevel: data.classLevel,
          difficulty: data.difficulty
        }));

        // Create a new study session
        const sessionId = `session-${Date.now()}`;
        const sessionData = {
          sessionId,
          flashcards,
          round: 1,
          totalRounds: data.rounds
        };

        // Store session data
        sessionStorage.setItem(`flashcards-${sessionId}`, JSON.stringify(sessionData));

        return sessionId;
      } catch (error) {
        console.error('Error starting study session:', error);
        throw error;
      }
    },
    onSuccess: (sessionId) => {
      // Navigate to the flashcards page with the new session ID
      setLocation(`/flashcards/${sessionId}`);
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive",
      });
      console.error('Error in study mutation:', error);
    }
  });

  const onSubmitTopic = (values: TopicSettingsFormValues) => {
    startStudyMutation.mutate(values);
  };

  const onSubmitPdf = (values: PdfSettingsFormValues) => {
    if (!uploadedPdfId) {
      toast({
        title: "Missing Document",
        description: "Please upload a PDF document first.",
        variant: "destructive",
      });
      return;
    }
    
    // Make sure to include the PDF ID
    startStudyMutation.mutate({
      ...values,
      pdfId: uploadedPdfId
    });
  };

  const handlePdfUpload = (id: string, name: string) => {
    setUploadedPdfId(id);
    setUploadedPdfName(name);
    pdfForm.setValue("pdfId", id);
    toast({
      title: "PDF Uploaded",
      description: `${name} has been uploaded successfully.`,
    });
  };

  return (
    <Tabs defaultValue="topic" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="topic">Subject Topic</TabsTrigger>
        <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
      </TabsList>
      
      <TabsContent value="topic">
        <Form {...topicForm}>
          <form onSubmit={topicForm.handleSubmit(onSubmitTopic)} className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Topic Settings</h2>
            
            {/* Subject Selection */}
            <FormField
              control={topicForm.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Level Selection */}
            <FormField
              control={topicForm.control}
              name="classLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Level */}
            <FormField
              control={topicForm.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <div className="flex space-x-2">
                    {difficultyLevels.map((level) => (
                      <Button
                        key={level.value}
                        type="button"
                        variant="outline"
                        className={`flex-1 flex justify-center items-center space-x-1 ${
                          field.value === level.value 
                            ? 'bg-primary text-primary-foreground' 
                            : `bg-${level.color} bg-opacity-10 border-${level.color} border-opacity-30 text-${level.color}`
                        }`}
                        onClick={() => field.onChange(level.value)}
                      >
                        <i className={`fas fa-${level.icon}`}></i>
                        <span>{level.label}</span>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Count */}
            <FormField
              control={topicForm.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <div className="flex space-x-2">
                    {questionCounts.map((count) => (
                      <Button
                        key={count.value}
                        type="button"
                        variant="outline"
                        className={`flex-1 ${
                          field.value === count.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => field.onChange(count.value)}
                      >
                        {count.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Rounds */}
            <FormField
              control={topicForm.control}
              name="rounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Rounds</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <span className="text-sm font-medium w-6 text-center">{field.value}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              disabled={startStudyMutation.isPending}
            >
              {startStudyMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  <span>Creating Cards...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-play-circle mr-2"></i>
                  <span>Start Studying</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="pdf">
        <Form {...pdfForm}>
          <form onSubmit={pdfForm.handleSubmit(onSubmitPdf)} className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">PDF Document Settings</h2>
            
            {/* Custom Content Upload */}
            <FormItem>
              <FormLabel>Upload PDF Document</FormLabel>
              <PdfUploader onUploadSuccess={handlePdfUpload} />
              {uploadedPdfName && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <i className="fas fa-check-circle"></i>
                  <span>Uploaded: {uploadedPdfName}</span>
                </div>
              )}
              <FormMessage />
            </FormItem>

            {/* Difficulty Level */}
            <FormField
              control={pdfForm.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <div className="flex space-x-2">
                    {difficultyLevels.map((level) => (
                      <Button
                        key={level.value}
                        type="button"
                        variant="outline"
                        className={`flex-1 flex justify-center items-center space-x-1 ${
                          field.value === level.value 
                            ? 'bg-primary text-primary-foreground' 
                            : `bg-${level.color} bg-opacity-10 border-${level.color} border-opacity-30 text-${level.color}`
                        }`}
                        onClick={() => field.onChange(level.value)}
                      >
                        <i className={`fas fa-${level.icon}`}></i>
                        <span>{level.label}</span>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Count */}
            <FormField
              control={pdfForm.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <div className="flex space-x-2">
                    {questionCounts.map((count) => (
                      <Button
                        key={count.value}
                        type="button"
                        variant="outline"
                        className={`flex-1 ${
                          field.value === count.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => field.onChange(count.value)}
                      >
                        {count.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Rounds */}
            <FormField
              control={pdfForm.control}
              name="rounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Rounds</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <span className="text-sm font-medium w-6 text-center">{field.value}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              disabled={startStudyMutation.isPending || !uploadedPdfId}
            >
              {startStudyMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  <span>Creating Cards...</span>
                </>
              ) : uploadedPdfId ? (
                <>
                  <i className="fas fa-play-circle mr-2"></i>
                  <span>Start Studying</span>
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  <span>Upload PDF First</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
