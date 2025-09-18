
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    try {

      const user = await this.userService.findByEmail(email, { relations: ['userType'] });

      if (!user) return null;

      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {

        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.userType?.name || 'guest',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
