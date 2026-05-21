import { User, UserRole } from '../../models/user.model';
import { UserResponseDto, UpdateUserRequestDto } from '../../models/dto/user.dto';

export function mapUserDtoToUser(dto: UserResponseDto): User {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    role: dto.role as UserRole,
    enabled: dto.enabled,
  };
}

export function mapUpdateUserToDto(user: Partial<User>): UpdateUserRequestDto {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    enabled: user.enabled,
  };
}
