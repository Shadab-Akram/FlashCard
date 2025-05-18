import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subjects, classLevels, difficultyLevels, questionCounts } from "@shared/schema";

const studySettingsSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject" }),
  classLevel: z.string().min(1, { message: "Please select a class level" }),
  difficulty: z.string().min(1, { message: "Please select a difficulty level" }),
  count: z.number().min(5).max(15),
  rounds: z.number().min(1).max(5),
  pdfId: z.string().optional(),
});

type StudySettingsFormValues = z.infer<typeof studySettingsSchema>;

interface StudySettingsProps {
  onClose?: () => void;
}

export default function StudySettings({ onClose }: StudySettingsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedPdfId, setUploadedPdfId] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

  const form = useForm<StudySettingsFormValues>({
    resolver: zodResolver(studySettingsSchema),
    defaultValues: {
      subject: "",
      classLevel: "",
      difficulty: "medium",
      count: 10,
      rounds: 3,
    },
  });

  const startStudyMutation = useMutation({
    mutationFn: async (data: StudySettingsFormValues) => {
      const response = await apiRequest("POST", "/api/study-session", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your study session has been created!",
      });
      
      // Navigate to flashcards page with the session ID
      if (data.sessionId) {
        setLocation(`/flashcards/${data.sessionId}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive",
      });
      console.error("Study session error:", error);
    },
  });

  const onSubmit = (values: StudySettingsFormValues) => {
    // Add PDF ID if available
    if (uploadedPdfId) {
      values.pdfId = uploadedPdfId;
    }
    
    startStudyMutation.mutate(values);
  };

  const handlePdfUpload = (id: string, name: string) => {
    setUploadedPdfId(id);
    setUploadedPdfName(name);
    toast({
      title: "PDF Uploaded",
      description: `${name} has been uploaded successfully.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Study Settings</h2>
        
        {/* Subject Selection */}
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
                        ? 'bg-primary-400 text-white' 
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
          control={form.control}
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
                        ? 'bg-primary-400 text-white' 
                        : 'text-gray-600'
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
          control={form.control}
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

        {/* Custom Content Upload */}
        <FormItem>
          <FormLabel>Upload Custom Content</FormLabel>
          <PdfUploader onUploadSuccess={handlePdfUpload} />
          {uploadedPdfName && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <i className="fas fa-check-circle"></i>
              <span>Uploaded: {uploadedPdfName}</span>
            </div>
          )}
        </FormItem>

        {/* Start Button */}
        <Button 
          type="submit" 
          className="w-full bg-primary-400 text-white py-3 rounded-lg font-medium hover:bg-primary-500 transition-colors"
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
  );
}
