/**
 * Result from OCR service
 */
export interface OcrResult {
  /**
   * Extracted raw text from image
   */
  rawText: string;

  /**
   * Confidence score (0-1) if available
   */
  confidence?: number;

  /**
   * Any errors or warnings from OCR
   */
  warnings?: string[];
}
