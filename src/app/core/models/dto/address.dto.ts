export interface AddressDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CreateAddressRequestDto {
  firstName: string;
  lastName: string;
  company?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type UpdateAddressRequestDto = Partial<CreateAddressRequestDto>;
