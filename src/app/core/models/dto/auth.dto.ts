export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  password: string;
  confirmPassword: string;
}
