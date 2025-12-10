import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SharedStoreService } from './shared-store.service';
import { Category } from '../../receipts/entities/category.entity';
import { Store } from '../entities/store.entity';

describe('SharedStoreService', () => {
  let service: SharedStoreService;
  let categoryRepository: any;

  const mockCategory: Category = {
    id: 'category-id',
    name: 'Groceries',
    description: 'Grocery items',
    stores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCategoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockStoreRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedStoreService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockStoreRepository,
        },
      ],
    }).compile();

    service = module.get<SharedStoreService>(SharedStoreService);
    categoryRepository = module.get(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateCategory', () => {
    it('should return existing category if found', async () => {
      categoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOrCreateCategory('Groceries');

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Groceries' },
      });
      expect(categoryRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should create new category if not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.findOrCreateCategory('Electronics');

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Electronics' },
      });
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Electronics',
        description: null,
      });
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });
  });
});
