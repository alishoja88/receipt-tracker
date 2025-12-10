import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteStoreService } from './delete-store.service';
import { StoresRepository } from '../infrastructure/persistence/stores.repository';
import { Store } from '../entities/store.entity';

describe('DeleteStoreService', () => {
  let service: DeleteStoreService;
  let storesRepository: jest.Mocked<StoresRepository>;

  const mockStore: Store = {
    id: 'store-id',
    name: 'Test Store',
    address: '123 Test St',
    phone: '123-456-7890',
    categoryId: null,
    category: null,
    receipts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockStoresRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteStoreService,
        {
          provide: StoresRepository,
          useValue: mockStoresRepository,
        },
      ],
    }).compile();

    service = module.get<DeleteStoreService>(DeleteStoreService);
    storesRepository = module.get(StoresRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should delete store successfully', async () => {
      storesRepository.findById.mockResolvedValue(mockStore);
      storesRepository.delete.mockResolvedValue(undefined);

      await service.execute('store-id');

      expect(storesRepository.findById).toHaveBeenCalledWith('store-id');
      expect(storesRepository.delete).toHaveBeenCalledWith('store-id');
    });

    it('should throw NotFoundException if store not found', async () => {
      storesRepository.findById.mockResolvedValue(null);

      await expect(service.execute('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.execute('non-existent-id')).rejects.toThrow(
        'Store with ID non-existent-id not found',
      );
    });
  });
});
