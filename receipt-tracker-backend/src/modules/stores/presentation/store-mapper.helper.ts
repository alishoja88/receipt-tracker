import { StoreResponseDto } from '../dto/store-response.dto';

/**
 * Helper class for mapping Store entities to DTOs
 */
export class StoreMapper {
  /**
   * Map Store entity to StoreResponseDto
   */
  static toResponseDto(store: any): StoreResponseDto {
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      category: store.category
        ? {
            id: store.category.id,
            name: store.category.name,
            description: store.category.description,
          }
        : null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  /**
   * Map Store entity to list item DTO (simplified)
   */
  static toListItemDto(store: any) {
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      category: store.category
        ? {
            id: store.category.id,
            name: store.category.name,
          }
        : null,
      createdAt: store.createdAt,
    };
  }
}
