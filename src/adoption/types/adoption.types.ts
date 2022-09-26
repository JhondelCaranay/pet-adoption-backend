import { Pet, User } from '@prisma/client';

export type Adoption = {
  schedule: string;
  status: string;
  adopter: User;
  adoptee: Pet;
};
