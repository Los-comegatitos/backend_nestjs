import { User_Type } from 'src/user_type/user_type.entity';

export class UserResponseDto {
  id: number;
  email: string;
  typeuser: User_Type;
}
