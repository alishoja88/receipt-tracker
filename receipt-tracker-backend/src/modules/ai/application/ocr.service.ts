import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { OcrResult } from '../interfaces';

/**
 * OCR Service using Google Cloud Vision API
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OCR_API_KEY') || '';
    this.apiEndpoint =
      this.configService.get<string>('OCR_API_ENDPOINT') ||
      'https://vision.googleapis.com/v1/images:annotate';

    this.httpClient = axios.create({
      timeout: 60000, // Increased to 60 seconds for large images
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!this.apiKey) {
      this.logger.warn('OCR_API_KEY not configured. OCR service will not work.');
    }
  }

  /**
   * Extract text from receipt image using OCR
   */
  async extractText(imageBuffer: Buffer): Promise<OcrResult> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'OCR service is not configured. Please set OCR_API_KEY in environment variables.',
      );
    }

    try {
      this.logger.log('Starting OCR text extraction...');

      // Check if using OCR.space API
      const isOcrSpace = this.apiEndpoint.includes('ocr.space');

      if (isOcrSpace) {
        return await this.extractTextWithOcrSpace(imageBuffer);
      } else {
        return await this.extractTextWithGoogleVision(imageBuffer);
      }
    } catch (error) {
      this.logger.error('OCR extraction failed', error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.ErrorMessage ||
          error.message;
        throw new InternalServerErrorException(`OCR API error: ${message}`);
      }

      // If it's a regular Error, pass the message through
      if (error instanceof Error) {
        throw new InternalServerErrorException(`OCR error: ${error.message}`);
      }

      throw new InternalServerErrorException('Failed to extract text from image');
    }
  }

  /**
   * Extract text using OCR.space API
   */
  private async extractTextWithOcrSpace(imageBuffer: Buffer): Promise<OcrResult> {
    // Preprocess image for better OCR accuracy
    let processedBuffer = await this.preprocessImageForOcr(imageBuffer);

    // OCR.space free tier has 1MB limit, check and compress if needed
    const maxSizeBytes = 1024 * 1024; // 1MB

    // If image is too large after preprocessing, compress further
    if (processedBuffer.length > maxSizeBytes) {
      this.logger.warn(
        `Image size ${(processedBuffer.length / 1024).toFixed(2)}KB exceeds 1MB limit. Compressing...`,
      );
      processedBuffer = await this.compressImage(processedBuffer);

      if (processedBuffer.length > maxSizeBytes) {
        throw new Error(
          `Image is too large (${(imageBuffer.length / 1024).toFixed(2)}KB). ` +
            `OCR.space free tier supports maximum 1MB. Please use a smaller image or upgrade your OCR.space plan.`,
        );
      }
    }

    this.logger.log(
      `Sending image to OCR.space API (${(processedBuffer.length / 1024).toFixed(2)}KB)...`,
    );

    const formData = new FormData();

    // Convert buffer to base64
    const base64Image = processedBuffer.toString('base64');

    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('apikey', this.apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('scale', 'true'); // Enable auto-scaling for better accuracy
    formData.append('OCREngine', '2'); // Use OCR Engine 2 (more accurate and faster)

    // Retry logic for OCR.space API (it can be slow sometimes)
    let lastError: Error | null = null;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`OCR attempt ${attempt}/${maxRetries}...`);

        const response = await this.httpClient.post(this.apiEndpoint, formData, {
          headers: formData.getHeaders(),
          timeout: 45000, // 45 seconds per attempt
        });

        // Check for successful response
        if (response.data.OCRExitCode === 1) {
          this.logger.log('OCR.space API responded successfully');
          return this.parseOcrSpaceResponse(response.data);
        }

        // If OCRExitCode is not 1, log the error and retry
        const errorMessage = response.data.ErrorMessage?.[0] || 'OCR processing failed';
        this.logger.warn(`OCR.space error (attempt ${attempt}): ${errorMessage}`);
        lastError = new Error(errorMessage);

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          this.logger.log('Retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMsg =
            error.code === 'ECONNABORTED'
              ? `OCR.space timeout (attempt ${attempt}/${maxRetries})`
              : `OCR.space API error: ${error.message}`;
          this.logger.warn(errorMsg);
          lastError = error;

          // If this is not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            this.logger.log('Retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          throw error;
        }
      }
    }

    // All retries failed
    if (lastError) {
      throw lastError;
    }

    throw new Error('OCR processing failed after all retries');
  }

  /**
   * Parse OCR.space API response
   */
  private parseOcrSpaceResponse(responseData: any): OcrResult {
    const parsedResults = responseData.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      this.logger.warn('No text detected in image');
      return {
        rawText: '',
        confidence: 0,
        warnings: ['No text detected in image'],
      };
    }

    const rawText = parsedResults[0].ParsedText || '';
    const confidence = 0.9; // OCR.space doesn't provide confidence, use default

    this.logger.log(`OCR extraction successful. Text length: ${rawText.length}`);

    return {
      rawText,
      confidence,
      warnings: undefined,
    };
  }

  /**
   * Extract text using Google Cloud Vision API
   */
  private async extractTextWithGoogleVision(imageBuffer: Buffer): Promise<OcrResult> {
    // Preprocess image for better OCR accuracy
    const processedBuffer = await this.preprocessImageForOcr(imageBuffer);

    // Convert buffer to base64
    const base64Image = processedBuffer.toString('base64');

    // Prepare request for Google Cloud Vision API
    // Using both TEXT_DETECTION and DOCUMENT_TEXT_DETECTION for better date extraction
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ['en'], // English language hint
          },
        },
      ],
    };

    // Call Google Cloud Vision API
    const response = await this.httpClient.post(
      `${this.apiEndpoint}?key=${this.apiKey}`,
      requestBody,
    );

    // Extract text from response
    const annotations = response.data.responses[0];

    if (annotations.error) {
      throw new Error(annotations.error.message);
    }

    if (!annotations.fullTextAnnotation) {
      this.logger.warn('No text detected in image');
      return {
        rawText: '',
        confidence: 0,
        warnings: ['No text detected in image'],
      };
    }

    const rawText = annotations.fullTextAnnotation.text || '';
    const confidence = this.calculateConfidence(annotations);

    this.logger.log(`OCR extraction successful. Text length: ${rawText.length}`);

    return {
      rawText,
      confidence,
      warnings: confidence < 0.7 ? ['Low OCR confidence - may need review'] : undefined,
    };
  }

  /**
   * Calculate average confidence from OCR results
   */
  private calculateConfidence(annotations: any): number {
    try {
      if (!annotations.fullTextAnnotation?.pages) {
        return 0;
      }

      let totalConfidence = 0;
      let count = 0;

      for (const page of annotations.fullTextAnnotation.pages) {
        if (page.confidence !== undefined) {
          totalConfidence += page.confidence;
          count++;
        }
      }

      return count > 0 ? totalConfidence / count : 0.5;
    } catch {
      return 0.5;
    }
  }

  /**
   * Validate image format
   */
  isValidImageFormat(mimetype: string): boolean {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    return validFormats.includes(mimetype);
  }

  /**
   * Preprocess image for better OCR accuracy
   * - Enhances contrast and sharpness
   * - Converts to grayscale for better text detection
   * - Ensures optimal resolution
   * - Auto-rotates if needed
   */
  private async preprocessImageForOcr(imageBuffer: Buffer): Promise<Buffer> {
    try {
      this.logger.log('Preprocessing image for OCR...');

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      this.logger.log(
        `Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`,
      );

      // Process image for better OCR
      let processed = sharp(imageBuffer)
        // Auto-rotate based on EXIF orientation
        .rotate()
        // Resize if too large (max 3000px on longest side for optimal OCR)
        .resize(3000, 3000, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3, // High-quality resize
        })
        // Convert to grayscale for better text detection
        .grayscale()
        // Enhance contrast and sharpness for better text recognition
        .normalize() // Auto-adjust contrast
        // More aggressive sharpening for better number/date detection
        .sharpen({
          sigma: 2.0, // Stronger sharpening (was 1.5)
          m1: 1.5, // More contrast in flat areas (was 1.0)
          m2: 0.7, // Better edge detection (was 0.5)
        })
        // Increase brightness and contrast for clearer text
        .linear(1.2, 5) // Multiply by 1.2, add 5 (was 1.1, 0)
        // Apply threshold to make text more distinct (helps with numbers)
        .modulate({
          brightness: 1.1, // Slightly brighter
          saturation: 0.5, // Less saturation (cleaner text)
        });

      // Convert to high-quality JPEG
      const result = await processed
        .jpeg({
          quality: 95,
          chromaSubsampling: '4:4:4', // Best quality
        })
        .toBuffer();

      this.logger.log(`Image preprocessed: ${(result.length / 1024).toFixed(2)}KB`);
      return result;
    } catch (error) {
      this.logger.warn('Image preprocessing failed, using original', error);
      return imageBuffer;
    }
  }

  /**
   * Compress image to reduce file size for OCR.space (1MB limit)
   */
  private async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const maxSizeBytes = 1024 * 1024; // 1MB
      let quality = 80;
      let compressed = imageBuffer;

      // Try compressing with decreasing quality until under 1MB
      for (let attempt = 0; attempt < 5 && compressed.length > maxSizeBytes; attempt++) {
        compressed = await sharp(imageBuffer)
          .jpeg({ quality, mozjpeg: true })
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();

        if (compressed.length <= maxSizeBytes) {
          this.logger.log(
            `Image compressed successfully: ${(compressed.length / 1024).toFixed(2)}KB`,
          );
          return compressed;
        }

        quality -= 10; // Reduce quality for next attempt
      }

      // If still too large, try more aggressive compression
      if (compressed.length > maxSizeBytes) {
        compressed = await sharp(imageBuffer)
          .jpeg({ quality: 60, mozjpeg: true })
          .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
      }

      return compressed;
    } catch (error) {
      this.logger.warn('Image compression failed, using original', error);
      return imageBuffer;
    }
  }

  /**
   * Check if OCR service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
