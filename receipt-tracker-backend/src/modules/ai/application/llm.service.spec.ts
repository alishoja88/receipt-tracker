import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { LlmService } from './llm.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LlmService', () => {
  let service: LlmService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-openai-key';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseReceiptText', () => {
    const mockRawText = `
      Walmart Supercenter
      123 Main Street
      Phone: 555-1234
      
      Date: 01/15/2024
      
      Milk - $3.99
      Bread - $2.50
      Eggs - $4.99
      
      Subtotal: $11.48
      Tax: $0.92
      Total: $12.40
    `;

    it('should parse receipt text successfully', async () => {
      const mockOpenAIResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  store: {
                    name: 'Walmart Supercenter',
                    address: '123 Main Street',
                    phone: '555-1234',
                    categoryName: 'Groceries',
                  },
                  receiptDate: '2024-01-15',
                  totals: {
                    subtotal: 11.48,
                    tax: 0.92,
                    total: 12.4,
                  },
                  categoryReceipts: [
                    {
                      category: 'GROCERY',
                      subtotal: 11.48,
                      tax: 0.92,
                      total: 12.4,
                    },
                  ],
                  needsReview: false,
                }),
              },
            },
          ],
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue(mockOpenAIResponse),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LlmService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const freshService = module.get<LlmService>(LlmService);
      const result = await freshService.parseReceiptText(mockRawText);

      expect(result.store.name).toBe('Walmart Supercenter');
      expect(result.totals.total).toBe(12.4);
      expect(result.categoryReceipts).toHaveLength(1);
      expect(result.categoryReceipts[0].category).toBe('GROCERY');
      expect(result.categoryReceipts[0].total).toBe(12.4);
    });

    it('should throw error when API key is not configured', async () => {
      const noKeyConfigService = {
        get: jest.fn(() => undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LlmService,
          {
            provide: ConfigService,
            useValue: noKeyConfigService,
          },
        ],
      }).compile();

      const serviceWithoutKey = module.get<LlmService>(LlmService);

      await expect(serviceWithoutKey.parseReceiptText(mockRawText)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw error for empty text', async () => {
      await expect(service.parseReceiptText('')).rejects.toThrow(InternalServerErrorException);
      await expect(service.parseReceiptText('   ')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when required fields are missing', async () => {
      const mockInvalidResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  store: {},
                  totals: {},
                }),
              },
            },
          ],
        },
      };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue(mockInvalidResponse),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LlmService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const freshService = module.get<LlmService>(LlmService);

      await expect(freshService.parseReceiptText(mockRawText)).rejects.toThrow();
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
          LlmService,
          {
            provide: ConfigService,
            useValue: noKeyConfigService,
          },
        ],
      }).compile();

      module.then(mod => {
        const serviceWithoutKey = mod.get<LlmService>(LlmService);
        expect(serviceWithoutKey.isAvailable()).toBe(false);
      });
    });
  });
});
