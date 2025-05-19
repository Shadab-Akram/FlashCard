import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface PdfUploaderProps {
  onUploadSuccess: (id: string, name: string) => void;
}

export function PdfUploader({ onUploadSuccess }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFile = async (file: File) => {
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate a unique ID for the file
      const fileId = `pdf-${Date.now()}`;
      
      // Store the file content in localStorage (just the name for now)
      localStorage.setItem(fileId, file.name);
      
      // Call the success callback with the document ID and name
      onUploadSuccess(fileId, file.name);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: "PDF uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to handle the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-muted"
      } ${isUploading ? "opacity-70" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-1">
        {isUploading ? (
          <>
            <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <i className="fas fa-file-upload text-muted-foreground text-xl"></i>
            <p className="text-sm text-muted-foreground">Drag and drop your PDF here, or</p>
            <button 
              type="button"
              className="text-primary font-medium text-sm hover:underline"
              onClick={handleBrowseFiles}
            >
              browse files
            </button>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileInputChange}
        disabled={isUploading}
      />
    </div>
  );
}
