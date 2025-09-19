import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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

  login(user: Omit<User, 'password'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.typeuser?.name.toLowerCase() || 'guest',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
