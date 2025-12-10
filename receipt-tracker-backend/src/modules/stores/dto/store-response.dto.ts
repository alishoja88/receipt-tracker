export class CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
}

export class StoreResponseDto {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  category: CategoryResponseDto | null;
  createdAt: Date;
  updatedAt: Date;
}
