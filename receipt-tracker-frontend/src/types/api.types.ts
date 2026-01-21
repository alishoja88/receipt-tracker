export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}
