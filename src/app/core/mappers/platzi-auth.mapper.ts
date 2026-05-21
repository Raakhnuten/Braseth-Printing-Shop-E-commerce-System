import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { AuthUser } from '../models/auth.model';
import { PlatziUser } from '../models/platzi/platzi-user.model';
import { PlatziLoginResponse } from '../models/platzi/platzi-auth.model';
import { mapPlatziUserToAuthUser } from './platzi-user.mapper';

export function mapPlatziLoginToAuthResponse(
  loginRes: PlatziLoginResponse,
  user: PlatziUser,
): AuthResponse {
  const authUser: AuthUser = mapPlatziUserToAuthUser(
    user,
    loginRes.access_token,
    loginRes.refresh_token,
    3600,
  );
  return {
    user: authUser,
    token: loginRes.access_token,
    refreshToken: loginRes.refresh_token,
    expiresIn: 3600,
  };
}

export function mapRegisterRequestToPlatziPayload(req: RegisterRequest): {
  name: string;
  email: string;
  password: string;
  avatar: string;
} {
  return {
    name: `${req.firstName} ${req.lastName}`.trim(),
    email: req.email,
    password: req.password,
    avatar: 'https://via.placeholder.com/150',
  };
}

export function mapLoginRequestToPlatziPayload(req: LoginRequest): {
  email: string;
  password: string;
} {
  return {
    email: req.email,
    password: req.password,
  };
}
