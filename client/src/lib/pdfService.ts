// Function to upload a PDF file
export async function uploadPdf(file: File): Promise<{ id: string; name: string }> {
  try {
    // Create form data for the file
    const formData = new FormData();
    formData.append("pdf", file);

    // Upload the file
    const response = await fetch("/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload PDF");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
}

// Function to validate a PDF file
export function validatePdfFile(file: File): { valid: boolean; message?: string } {
  // Check if the file is a PDF
  if (file.type !== "application/pdf") {
    return {
      valid: false,
      message: "Only PDF files are allowed.",
    };
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      message: "Maximum file size is 10MB.",
    };
  }

  return { valid: true };
}
