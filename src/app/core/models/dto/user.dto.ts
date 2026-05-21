export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
}

export interface UpdateUserRequestDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  enabled?: boolean;
}

export interface UserListResponseDto {
  content: UserResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
