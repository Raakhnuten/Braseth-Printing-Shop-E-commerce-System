export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
  errors?: ApiError[];
}

export interface ApiMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  field: string;
  message: string;
  code: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}