import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../../models/auth.model';
import { AuthResponseDto, AuthUserDto, LoginRequestDto, RegisterRequestDto } from '../../models/dto/auth.dto';

export function mapAuthResponseDtoToAuthResponse(dto: AuthResponseDto): AuthResponse {
  return {
    user: mapAuthUserDtoToAuthUser(dto.user),
    token: dto.token,
    refreshToken: dto.refreshToken,
    expiresIn: dto.expiresIn,
  };
}

export function mapAuthUserDtoToAuthUser(dto: AuthUserDto): AuthUser {
  return { ...dto };
}

export function mapLoginRequestToDto(req: LoginRequest): LoginRequestDto {
  return { email: req.email, password: req.password };
}

export function mapRegisterRequestToDto(req: RegisterRequest): RegisterRequestDto {
  return {
    firstName: req.firstName,
    lastName: req.lastName,
    email: req.email,
    phone: req.phone,
    password: req.password,
  };
}
