import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OcrService', () => {
  let service: OcrService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OCR_API_KEY') return 'test-api-key';
      if (key === 'OCR_API_ENDPOINT') return 'https://vision.googleapis.com/v1/images:annotate';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractText', () => {
    const mockImageBuffer = Buffer.from('fake image data');

    it('should extract text successfully from image', async () => {
      const mockResponse = {
        data: {
          responses: [
            {
              fullTextAnnotation: {
                text: 'Receipt\nStore Name\nTotal: $100',
                pages: [{ confidence: 0.95 }],
              },
            },
          ],
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const freshService = module.get<OcrService>(OcrService);
      const result = await freshService.extractText(mockImageBuffer);

      expect(result.rawText).toBe('Receipt\nStore Name\nTotal: $100');
      expect(result.confidence).toBe(0.95);
    });

    it('should throw error when API key is not configured', async () => {
      const noKeyConfigService = {
        get: jest.fn(() => undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: noKeyConfigService,
          },
        ],
      }).compile();

      const serviceWithoutKey = module.get<OcrService>(OcrService);

      await expect(serviceWithoutKey.extractText(mockImageBuffer)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return empty result when no text detected', async () => {
      const mockResponse = {
        data: {
          responses: [{}],
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const freshService = module.get<OcrService>(OcrService);
      const result = await freshService.extractText(mockImageBuffer);

      expect(result.rawText).toBe('');
      expect(result.confidence).toBe(0);
      expect(result.warnings).toContain('No text detected in image');
    });
  });

  describe('isValidImageFormat', () => {
    it('should return true for valid image formats', () => {
      expect(service.isValidImageFormat('image/jpeg')).toBe(true);
      expect(service.isValidImageFormat('image/jpg')).toBe(true);
      expect(service.isValidImageFormat('image/png')).toBe(true);
      expect(service.isValidImageFormat('application/pdf')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(service.isValidImageFormat('image/gif')).toBe(false);
      expect(service.isValidImageFormat('application/json')).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when API key is configured', () => {
      expect(service.isAvailable()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      const noKeyConfigService = {
        get: jest.fn(() => undefined),
      };

      const module = Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: noKeyConfigService,
          },
        ],
      }).compile();

      module.then(mod => {
        const serviceWithoutKey = mod.get<OcrService>(OcrService);
        expect(serviceWithoutKey.isAvailable()).toBe(false);
      });
    });
  });
});
