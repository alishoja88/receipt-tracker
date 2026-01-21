/**
 * Converts backend error messages to user-friendly English messages
 */
export const getErrorMessage = (error: any): string => {
  // Extract error message from various error formats
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    error?.toString() ||
    'An unexpected error occurred. Please try again.';

  // Convert technical errors to user-friendly messages
  const lowerMessage = errorMessage.toLowerCase();

  // OCR/Image Processing Errors
  if (lowerMessage.includes('ocr error') || lowerMessage.includes('all images/pages errored')) {
    return 'Unable to read text from the image. Please make sure you uploaded a clear receipt image. Try taking a better photo with good lighting.';
  }

  if (lowerMessage.includes('no text could be extracted')) {
    return 'Could not extract any text from the image. Please upload a clear receipt photo with readable text.';
  }

  if (lowerMessage.includes('invalid image format')) {
    return 'Invalid file format. Please upload a receipt image (JPG, PNG) or PDF file.';
  }

  if (lowerMessage.includes('file size exceeds') || lowerMessage.includes('max file size')) {
    return 'File is too large. Please upload a file smaller than 10MB.';
  }

  // File Type Validation
  if (lowerMessage.includes('file type') || lowerMessage.includes('unsupported format')) {
    return 'This file type is not supported. Please upload a JPG, PNG, or PDF file.';
  }

  // AI Service Errors
  if (
    lowerMessage.includes('ai services are not configured') ||
    lowerMessage.includes('ocr_api_key') ||
    lowerMessage.includes('openai_api_key')
  ) {
    return 'AI services are temporarily unavailable. Please try again later or contact support.';
  }

  if (lowerMessage.includes('openai api error')) {
    return 'AI processing failed. Please try uploading the receipt again.';
  }

  // Receipt Validation Errors
  if (
    lowerMessage.includes('not a valid receipt') ||
    lowerMessage.includes('could not parse receipt')
  ) {
    return 'This does not appear to be a valid receipt. Please upload a clear photo of a receipt with store name, date, and total amount visible.';
  }

  // Duplicate Receipt Errors
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return errorMessage; // Return the original message as it's already user-friendly
  }

  // Network Errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('connection')
  ) {
    return 'Connection error. Please check your internet connection and try again.';
  }

  // Generic Server Errors
  if (lowerMessage.includes('internal server error') || lowerMessage.includes('500')) {
    return 'Server error occurred. Please try again in a few moments.';
  }

  // Bad Request Errors
  if (lowerMessage.includes('bad request') || lowerMessage.includes('400')) {
    return 'Invalid request. Please check the file and try again.';
  }

  // Return original message if no specific match found
  return errorMessage;
};

/**
 * Checks if the error indicates the file is not a receipt
 */
export const isNotReceiptError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.message || error?.message || '';

  const lowerMessage = errorMessage.toLowerCase();

  return (
    lowerMessage.includes('not a valid receipt') ||
    lowerMessage.includes('could not parse receipt') ||
    lowerMessage.includes('does not appear to be a receipt')
  );
};

/**
 * Checks if the error is recoverable (user can try again)
 */
export const isRecoverableError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.message || error?.message || '';

  const lowerMessage = errorMessage.toLowerCase();

  // Non-recoverable errors (configuration issues)
  if (lowerMessage.includes('ai services are not configured')) {
    return false;
  }

  // All other errors are recoverable
  return true;
};
