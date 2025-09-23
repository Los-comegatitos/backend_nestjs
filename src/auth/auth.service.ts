import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

interface UserEntity {
  id: number;
  email: string;
  typeuser: { name: string };
  password?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user: User = await this.userService.findByEmail(email);

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) return null;

      const { password: _password, ...result } = user;
      return result;
    } catch (err) {
      console.error('Error validating user:', err);
      return null;
    }
  }

  login(user: UserEntity) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.typeuser?.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
