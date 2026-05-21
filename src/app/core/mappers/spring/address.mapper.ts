import { Address } from '../../models/address.model';
import { AddressDto, CreateAddressRequestDto } from '../../models/dto/address.dto';

export function mapAddressDtoToAddress(dto: AddressDto): Address {
  return { ...dto };
}

export function mapCreateAddressToDto(address: Partial<Address>): CreateAddressRequestDto {
  return {
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    company: address.company,
    streetAddress: address.streetAddress || '',
    apartment: address.apartment,
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || '',
    country: address.country || '',
    phone: address.phone || '',
    isDefault: address.isDefault ?? false,
  };
}
