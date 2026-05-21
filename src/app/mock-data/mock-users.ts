import { User, UserRole } from '../core/models/user.model';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0101',
    role: UserRole.CUSTOMER,
    enabled: true,
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-0102',
    role: UserRole.CUSTOMER,
    enabled: true,
  },
  {
    id: 'user-3',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+1 555-0103',
    role: UserRole.ADMIN,
    enabled: true,
  },
];