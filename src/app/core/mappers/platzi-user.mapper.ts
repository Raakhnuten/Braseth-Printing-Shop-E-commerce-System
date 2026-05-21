import { User, UserRole } from '../models/user.model';
import { AuthUser } from '../models/auth.model';
import { PlatziUser } from '../models/platzi/platzi-user.model';

export function mapPlatziUserToUser(pu: PlatziUser): User {
  const nameParts = pu.name.trim().split(/\s+/);
  return {
    id: String(pu.id),
    firstName: nameParts[0] || pu.name,
    lastName: nameParts.slice(1).join(' ') || '',
    email: pu.email,
    phone: '',
    role: pu.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
    enabled: true,
  };
}

export function mapPlatziUserToAuthUser(
  pu: PlatziUser,
  token: string,
  refreshToken: string,
  expiresIn = 3600,
): AuthUser {
  const nameParts = pu.name.trim().split(/\s+/);
  return {
    id: String(pu.id),
    firstName: nameParts[0] || pu.name,
    lastName: nameParts.slice(1).join(' ') || '',
    email: pu.email,
    phone: '',
    role: pu.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
    enabled: true,
    token,
    refreshToken,
    expiresIn,
  };
}
