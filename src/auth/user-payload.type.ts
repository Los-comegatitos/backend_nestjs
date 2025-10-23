import { Role } from 'src/auth/roles.enum';

export type UserPayload = {
  userId: number;
  email: string;
  role: Role;
};
